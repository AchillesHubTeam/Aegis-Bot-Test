import "dotenv/config";
import {
  ActivityType,
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

type AuditLevel = "info" | "warn" | "error";

const config = {
  token: process.env.DISCORD_BOT_TOKEN ?? "",
  clientId: process.env.DISCORD_CLIENT_ID ?? "",
  guildId: process.env.DISCORD_GUILD_ID ?? "",
  ownerId: process.env.BOT_OWNER_ID ?? "",
  supportWebhookUrl: process.env.SUPPORT_WEBHOOK_URL ?? "",
  aiApiKey: process.env.OPENAI_API_KEY ?? "",
};

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Health check for the enterprise bot runtime."),
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Show premium bot diagnostics.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName("incident")
    .setDescription("Toggle incident mode for protected communities.")
    .addBooleanOption((option) => option.setName("enabled").setDescription("Enable or disable incident mode").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map((command) => command.toJSON());

class EnterpriseAuditLog {
  write(level: AuditLevel, message: string, metadata?: Record<string, string | number | boolean>) {
    const payload = {
      time: new Date().toISOString(),
      level,
      message,
      metadata,
    };

    console.log(JSON.stringify(payload));
  }
}

class EnterpriseDiscordBot {
  private readonly client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
  });

  private readonly audit = new EnterpriseAuditLog();
  private incidentMode = false;

  async start() {
    this.assertRequiredConfig();
    this.registerEvents();
    await this.registerSlashCommands();
    await this.client.login(config.token);
  }

  private assertRequiredConfig() {
    const required = ["DISCORD_BOT_TOKEN", "DISCORD_CLIENT_ID", "BOT_OWNER_ID"] as const;
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
  }

  private registerEvents() {
    this.client.once(Events.ClientReady, (readyClient) => {
      readyClient.user.setPresence({
        activities: [{ name: "Aegis enterprise dashboard", type: ActivityType.Watching }],
        status: "online",
      });

      this.audit.write("info", "Bot connected", {
        botTag: readyClient.user.tag,
        guilds: readyClient.guilds.cache.size,
      });
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) {
        return;
      }

      await this.handleCommand(interaction);
    });

    this.client.on(Events.Error, (error) => {
      this.audit.write("error", "Discord client error", { message: error.message });
    });
  }

  private async registerSlashCommands() {
    const rest = new REST({ version: "10" }).setToken(config.token);
    const route = config.guildId
      ? Routes.applicationGuildCommands(config.clientId, config.guildId)
      : Routes.applicationCommands(config.clientId);

    await rest.put(route, { body: commands });
    this.audit.write("info", "Slash commands registered", {
      scope: config.guildId ? "guild" : "global",
      commandCount: commands.length,
    });
  }

  private async handleCommand(interaction: ChatInputCommandInteraction) {
    if (interaction.commandName === "ping") {
      await interaction.reply({
        content: `Pong. API latency: ${Math.round(this.client.ws.ping)}ms`,
        ephemeral: true,
      });

      return;
    }

    if (interaction.commandName === "status") {
      await interaction.reply({
        content: [
          "Aegis Bot Enterprise Status",
          `Latency: ${Math.round(this.client.ws.ping)}ms`,
          `Incident mode: ${this.incidentMode ? "ON" : "OFF"}`,
          `AI provider configured: ${config.aiApiKey ? "yes" : "no"}`,
          `Support webhook configured: ${config.supportWebhookUrl ? "yes" : "no"}`,
        ].join("\n"),
        ephemeral: true,
      });

      return;
    }

    if (interaction.commandName === "incident") {
      if (interaction.user.id !== config.ownerId) {
        await interaction.reply({
          content: "Only the bot owner can toggle incident mode.",
          ephemeral: true,
        });

        this.audit.write("warn", "Unauthorized incident toggle attempt", {
          userId: interaction.user.id,
          guildId: interaction.guildId ?? "dm",
        });

        return;
      }

      const enabled = interaction.options.getBoolean("enabled", true);
      this.incidentMode = enabled;

      await interaction.reply({
        content: `Incident mode is now ${enabled ? "enabled" : "disabled"}.`,
        ephemeral: true,
      });

      this.audit.write("info", "Incident mode changed", {
        enabled,
        changedBy: interaction.user.id,
      });
    }
  }
}

const bot = new EnterpriseDiscordBot();

bot.start().catch((error) => {
  console.error("Failed to start enterprise Discord bot", error);
  process.exitCode = 1;
});