import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type Role = "developer" | "user";
type AuthMode = "login" | "register";
type WorkspaceTab = "overview" | "controls" | "security" | "automation";

type Account = {
  name: string;
  email: string;
  password: string;
  role: Role;
  company: string;
};

type Session = {
  email: string;
  role: Role;
};

type BotState = {
  online: boolean;
  aiModeration: boolean;
  premiumRouting: boolean;
  slowmodeShield: boolean;
  incidentMode: boolean;
};

const devInviteCode = "AEGIS-DEV-ACCESS";

const seedAccounts: Account[] = [
  {
    name: "Lead Bot Engineer",
    email: "dev@aegisbot.io",
    password: "DevPortal!23",
    role: "developer",
    company: "Aegis Labs",
  },
  {
    name: "Community Manager",
    email: "user@aegisbot.io",
    password: "UserPortal!23",
    role: "user",
    company: "Aegis Guild",
  },
];

const seedBotState: BotState = {
  online: true,
  aiModeration: true,
  premiumRouting: true,
  slowmodeShield: false,
  incidentMode: false,
};

const landingHighlights = [
  "Slash commands + automation workflows",
  "Role-based access for developer and customer portals",
  "Revenue controls, API key vault, audit logs, and uptime monitoring",
];

const liveSignals = [
  { label: "Gateway", value: "99.98%" },
  { label: "Commands", value: "2.4M/day" },
  { label: "Protected guilds", value: "184" },
];

const devMetrics = [
  { label: "Shard status", value: "12 / 12 healthy", detail: "Heartbeat 41ms" },
  { label: "Release channel", value: "stable-enterprise", detail: "Next rollout in 2h" },
  { label: "Monthly revenue", value: "$18,420", detail: "Enterprise + premium licenses" },
];

const userMetrics = [
  { label: "Your guilds", value: "8 connected", detail: "6 premium automations live" },
  { label: "Saved staff time", value: "112h", detail: "Based on moderated events" },
  { label: "Response SLA", value: "2m 18s", detail: "Priority support enabled" },
];

const developerPanels = [
  {
    title: "Deployment control",
    copy: "Promote commands, sync permissions, and route traffic between premium and standard clusters.",
    action: "Deploy update",
  },
  {
    title: "Secret governance",
    copy: "Track token rotation, external AI providers, webhook signatures, and vault ownership.",
    action: "Rotate secrets",
  },
  {
    title: "Incident response",
    copy: "Enable maintenance banners, disable risky commands, and broadcast to customer workspaces.",
    action: "Open incident room",
  },
];

const userPanels = [
  {
    title: "Automation builder",
    copy: "Chain welcome flows, ticket handoff, support escalation, and anti-raid defenses.",
    action: "Open automations",
  },
  {
    title: "License and billing",
    copy: "Track active seats, premium guild slots, renewal date, and custom support agreements.",
    action: "View subscription",
  },
  {
    title: "Server operations",
    copy: "Control feature packs, run diagnostics, and request live help for your Discord workspace.",
    action: "Run diagnostics",
  },
];

const automations = [
  {
    name: "AI moderation shield",
    description: "Detect spam bursts, phishing links, toxic language, and auto-quarantine high-risk members.",
  },
  {
    name: "Revenue command suite",
    description: "Sell premium roles, issue invoices, verify subscriptions, and unlock gated channels.",
  },
  {
    name: "Support workflow engine",
    description: "Create ticket queues, tag departments, collect evidence, and export transcripts.",
  },
];

function readStorage<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window.localStorage.getItem(key);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function MetricStrip({ items }: { items: Array<{ label: string; value: string; detail: string }> }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: index * 0.08 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
        >
          <p className="text-sm text-slate-400">{item.label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
          <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function App() {
  const [accounts, setAccounts] = useState<Account[]>(() => readStorage("aegis.accounts", seedAccounts));
  const [session, setSession] = useState<Session | null>(() => readStorage<Session | null>("aegis.session", null));
  const [botState, setBotState] = useState<BotState>(() => readStorage("aegis.botState", seedBotState));
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [tab, setTab] = useState<WorkspaceTab>("overview");
  const [loginForm, setLoginForm] = useState({ email: seedAccounts[0].email, password: seedAccounts[0].password });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    role: "user" as Role,
    inviteCode: "",
  });
  const [authMessage, setAuthMessage] = useState("Use the demo accounts below or create a new workspace.");

  useEffect(() => {
    saveStorage("aegis.accounts", accounts);
  }, [accounts]);

  useEffect(() => {
    saveStorage("aegis.session", session);
  }, [session]);

  useEffect(() => {
    saveStorage("aegis.botState", botState);
  }, [botState]);

  const currentAccount = useMemo(
    () => accounts.find((account) => account.email === session?.email) ?? null,
    [accounts, session?.email],
  );

  const metrics = currentAccount?.role === "developer" ? devMetrics : userMetrics;
  const rolePanels = currentAccount?.role === "developer" ? developerPanels : userPanels;

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const account = accounts.find(
      (item) => item.email.toLowerCase() === loginForm.email.toLowerCase() && item.password === loginForm.password,
    );

    if (!account) {
      setAuthMessage("Login failed. Check email and password, or use one of the demo accounts.");
      return;
    }

    setSession({ email: account.email, role: account.role });
    setTab("overview");
    setAuthMessage(`Welcome back, ${account.name}. ${account.role === "developer" ? "Developer" : "User"} portal ready.`);
  };

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (accounts.some((account) => account.email.toLowerCase() === registerForm.email.toLowerCase())) {
      setAuthMessage("That email is already in use. Try signing in instead.");
      return;
    }

    if (registerForm.role === "developer" && registerForm.inviteCode !== devInviteCode) {
      setAuthMessage(`Developer sign-up requires invite code: ${devInviteCode}`);
      return;
    }

    const nextAccount: Account = {
      name: registerForm.name.trim() || "New Operator",
      email: registerForm.email.trim(),
      password: registerForm.password,
      role: registerForm.role,
      company: registerForm.company.trim() || "Independent Workspace",
    };

    setAccounts((previous) => [...previous, nextAccount]);
    setSession({ email: nextAccount.email, role: nextAccount.role });
    setTab("overview");
    setRegisterForm({
      name: "",
      company: "",
      email: "",
      password: "",
      role: "user",
      inviteCode: "",
    });
    setAuthMessage(`Workspace created for ${nextAccount.company}. ${nextAccount.role === "developer" ? "Developer" : "User"} access granted.`);
  };

  if (currentAccount) {
    return (
      <div className="min-h-screen bg-[#050816] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute right-0 top-40 h-[20rem] w-[20rem] rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[18rem] w-[18rem] rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
          <header className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Aegis Enterprise Bot Control
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {currentAccount.role === "developer" ? "Developer command center" : "Customer operations workspace"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Signed in as {currentAccount.name} from {currentAccount.company}. Manage Discord automation, secrets, onboarding,
                and service health from one control plane.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-md">
                <motion.span
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.4 }}
                  className={`h-2.5 w-2.5 rounded-full ${botState.online ? "bg-emerald-400" : "bg-rose-400"}`}
                />
                {botState.online ? "Bot online" : "Bot offline"}
              </div>
              <button
                type="button"
                onClick={() => setSession(null)}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-100 transition hover:border-cyan-300 hover:bg-cyan-400/10"
              >
                Log out
              </button>
            </div>
          </header>

          <nav className="mt-6 flex flex-wrap gap-3">
            {(["overview", "controls", "security", "automation"] as WorkspaceTab[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                  tab === item ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <main className="mt-8 flex-1 space-y-8">
            <MetricStrip items={metrics} />

            <AnimatePresence mode="wait">
              <motion.section
                key={tab}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"
              >
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  {tab === "overview" && (
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Workspace summary</p>
                      <h2 className="mt-3 text-2xl font-semibold">One surface for bot health, revenue, and community operations</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                        This dashboard ships with developer and customer views, persistent account storage, live status controls,
                        and a bot scaffold in /bot ready for Discord token + API key setup.
                      </p>

                      <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {rolePanels.map((panel) => (
                          <div key={panel.title} className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                            <h3 className="text-lg font-medium">{panel.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-300">{panel.copy}</p>
                            <button
                              type="button"
                              className="mt-5 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
                            >
                              {panel.action}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tab === "controls" && (
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Runtime controls</p>
                      <h2 className="mt-3 text-2xl font-semibold">Control feature flags without leaving the portal</h2>
                      <div className="mt-8 space-y-4">
                        {[
                          { key: "online", label: "Gateway session", description: "Pause or resume the bot runtime for maintenance windows." },
                          { key: "aiModeration", label: "AI moderation", description: "Enable safety classifications, quarantine, and false-positive review." },
                          { key: "premiumRouting", label: "Premium routing", description: "Prioritize high-tier guild events and dedicated workflows." },
                          { key: "slowmodeShield", label: "Slowmode shield", description: "Auto-enable channel slowmode when raid patterns spike." },
                          { key: "incidentMode", label: "Incident mode", description: "Lock sensitive commands and publish a status warning banner." },
                        ].map((control) => {
                          const stateKey = control.key as keyof BotState;
                          const enabled = botState[stateKey];

                          return (
                            <div key={control.key} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5 md:flex-row md:items-center md:justify-between">
                              <div>
                                <h3 className="text-lg font-medium">{control.label}</h3>
                                <p className="mt-2 max-w-xl text-sm text-slate-300">{control.description}</p>
                              </div>
                              <button
                                type="button"
                                aria-pressed={enabled}
                                onClick={() => setBotState((previous) => ({ ...previous, [stateKey]: !enabled }))}
                                className={`inline-flex w-fit items-center gap-3 rounded-full px-4 py-2 text-sm font-medium transition ${
                                  enabled ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-white hover:bg-white/20"
                                }`}
                              >
                                <span className={`h-2.5 w-2.5 rounded-full ${enabled ? "bg-slate-950" : "bg-slate-300"}`} />
                                {enabled ? "Enabled" : "Disabled"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {tab === "security" && (
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Security and identity</p>
                      <h2 className="mt-3 text-2xl font-semibold">Accounts, secrets, and compliance checkpoints</h2>
                      <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {[
                          "Discord bot token: configured via .env and never hard-coded",
                          "External AI key vault: ready for OpenAI, Gemini, or internal moderation APIs",
                          "RBAC access: developer and customer accounts are isolated by role",
                          "Audit ledger: every critical action is timestamped in the bot scaffold",
                        ].map((item) => (
                          <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-sm leading-6 text-slate-200">
                            {item}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-6 text-cyan-50">
                        Active role: {currentAccount.role}. Demo developer invite code for new accounts: {devInviteCode}
                      </div>
                    </div>
                  )}

                  {tab === "automation" && (
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Automation suite</p>
                      <h2 className="mt-3 text-2xl font-semibold">Prebuilt workflows for moderation, monetization, and support</h2>
                      <div className="mt-8 space-y-4">
                        {automations.map((automation, index) => (
                          <motion.div
                            key={automation.name}
                            initial={{ opacity: 0, x: -18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.08 }}
                            className="rounded-3xl border border-white/10 bg-slate-950/40 p-5"
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                              <div>
                                <h3 className="text-lg font-medium">{automation.name}</h3>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{automation.description}</p>
                              </div>
                              <button
                                type="button"
                                className="rounded-full border border-white/15 px-4 py-2 text-sm transition hover:border-cyan-300 hover:bg-cyan-400/10"
                              >
                                Configure
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <aside className="space-y-6">
                  <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Live timeline</p>
                    <div className="mt-5 space-y-4 text-sm text-slate-200">
                      {[
                        `${botState.online ? "Bot session healthy" : "Gateway paused for maintenance"}`,
                        `${botState.aiModeration ? "AI moderation checks active" : "AI moderation is currently off"}`,
                        `${currentAccount.role === "developer" ? "Developer releases require secret rotation review" : "Customer workflow changes are versioned automatically"}`,
                      ].map((entry) => (
                        <div key={entry} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 leading-6">
                          {entry}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Demo accounts</p>
                    <div className="mt-5 space-y-3 text-sm text-slate-200">
                      {seedAccounts.map((account) => (
                        <div key={account.email} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                          <p className="font-medium">{account.role === "developer" ? "Developer" : "User"}</p>
                          <p className="mt-2 text-slate-300">{account.email}</p>
                          <p className="text-slate-400">{account.password}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              </motion.section>
            </AnimatePresence>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#040712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(79,70,229,0.24),transparent_28%),linear-gradient(180deg,#040712_0%,#07101f_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tracking-[0.28em] text-cyan-200">AEGIS BOT</p>
            <p className="mt-2 text-sm text-slate-400">Enterprise Discord automation, support, and control center</p>
          </div>
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className="rounded-full border border-white/15 px-4 py-2 text-sm transition hover:border-cyan-300 hover:bg-cyan-400/10"
          >
            Open portal
          </button>
        </header>

        <section className="grid min-h-[calc(100vh-6rem)] items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-200">Brand-first command platform</p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Aegis Bot turns Discord communities into secure, automated businesses.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Built for product teams, support teams, and community operators who need premium moderation, monetization,
              account control, and a clean dashboard for both bot developers and bot users.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Create workspace
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300 hover:bg-cyan-400/10"
              >
                Use demo portal
              </button>
            </div>

            <div className="mt-8 space-y-3 text-sm text-slate-300">
              {landingHighlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[2.5rem] bg-cyan-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a1326] shadow-2xl shadow-cyan-950/40">
              <div className="border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Realtime operations</p>
                    <p className="mt-2 text-2xl font-semibold">Bot + dashboard in one product</p>
                  </div>
                  <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                    Stable
                  </div>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {liveSignals.map((item) => (
                      <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                        <p className="mt-3 text-2xl font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Command throughput</p>
                        <p className="mt-2 text-3xl font-semibold">+34% this month</p>
                      </div>
                      <p className="text-sm text-emerald-300">Operational headroom: high</p>
                    </div>
                    <div className="mt-8 flex h-40 items-end gap-3">
                      {[42, 68, 55, 84, 72, 96, 88, 110].map((height, index) => (
                        <motion.div
                          key={`${height}-${index}`}
                          initial={{ height: 0 }}
                          animate={{ height }}
                          transition={{ duration: 0.5, delay: index * 0.08 + 0.2 }}
                          className="flex-1 rounded-t-full bg-gradient-to-t from-cyan-400 to-indigo-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">Portal access</p>
                  <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className={`rounded-full px-4 py-2 transition ${authMode === "login" ? "bg-white text-slate-950" : "text-slate-300"}`}
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className={`rounded-full px-4 py-2 transition ${authMode === "register" ? "bg-white text-slate-950" : "text-slate-300"}`}
                    >
                      Register
                    </button>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-300">{authMessage}</p>

                  <AnimatePresence mode="wait">
                    {authMode === "login" ? (
                      <motion.form
                        key="login"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.28 }}
                        onSubmit={handleLogin}
                        className="mt-6 space-y-4"
                      >
                        <label className="block">
                          <span className="mb-2 block text-sm text-slate-300">Email</span>
                          <input
                            value={loginForm.email}
                            onChange={(event) => setLoginForm((previous) => ({ ...previous, email: event.target.value }))}
                            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                            placeholder="dev@aegisbot.io"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm text-slate-300">Password</span>
                          <input
                            type="password"
                            value={loginForm.password}
                            onChange={(event) => setLoginForm((previous) => ({ ...previous, password: event.target.value }))}
                            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                            placeholder="Enter your password"
                          />
                        </label>

                        <button type="submit" className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                          Enter dashboard
                        </button>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="register"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.28 }}
                        onSubmit={handleRegister}
                        className="mt-6 space-y-4"
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-300">Name</span>
                            <input
                              value={registerForm.name}
                              onChange={(event) => setRegisterForm((previous) => ({ ...previous, name: event.target.value }))}
                              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                              placeholder="Your name"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-300">Company</span>
                            <input
                              value={registerForm.company}
                              onChange={(event) => setRegisterForm((previous) => ({ ...previous, company: event.target.value }))}
                              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                              placeholder="Workspace name"
                            />
                          </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-300">Email</span>
                            <input
                              value={registerForm.email}
                              onChange={(event) => setRegisterForm((previous) => ({ ...previous, email: event.target.value }))}
                              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                              placeholder="you@company.com"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-300">Password</span>
                            <input
                              type="password"
                              value={registerForm.password}
                              onChange={(event) => setRegisterForm((previous) => ({ ...previous, password: event.target.value }))}
                              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                              placeholder="Create a password"
                            />
                          </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-300">Role</span>
                            <select
                              value={registerForm.role}
                              onChange={(event) => setRegisterForm((previous) => ({ ...previous, role: event.target.value as Role }))}
                              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                            >
                              <option value="user">User</option>
                              <option value="developer">Developer</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-300">Developer invite code</span>
                            <input
                              value={registerForm.inviteCode}
                              onChange={(event) => setRegisterForm((previous) => ({ ...previous, inviteCode: event.target.value }))}
                              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                              placeholder="Only required for developer accounts"
                            />
                          </label>
                        </div>

                        <button type="submit" className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                          Create account and enter
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {seedAccounts.map((account) => (
                      <div key={account.email} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                        <p className="font-medium">{account.role === "developer" ? "Developer demo" : "User demo"}</p>
                        <p className="mt-2 text-slate-400">{account.email}</p>
                        <p className="text-slate-500">{account.password}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 border-t border-white/10 py-16 lg:grid-cols-3">
          {[
            {
              title: "Enterprise bot core",
              copy: "Included starter bot architecture uses discord.js, dotenv, slash command registration, audit logging, and health telemetry.",
            },
            {
              title: "Identity system",
              copy: "Demo auth flows persist accounts in local storage and separate developer and user workspaces to show the control model.",
            },
            {
              title: "Setup package",
              copy: "Project now includes .env, .env.example, README.md, and bot/index.ts so you can continue wiring real services.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.copy}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
