# Aegis Bot Enterprise Starter

This project now includes a polished React dashboard and a starter Discord bot scaffold aimed at an enterprise-style setup.

## Included

- `src/App.tsx`: branded landing page + dashboard with separate developer and user portals
- `bot/index.ts`: Discord bot scaffold using `discord.js` and `dotenv`
- `.env` and `.env.example`: environment fields for bot token, API keys, app secrets, and infra URLs
- `README.md`: setup notes and demo credentials

## Dashboard features

- Full landing page for the product brand
- Sign in and register flows
- Role split between `developer` and `user`
- Local account persistence using browser storage
- Runtime control toggles for bot state
- Security, automation, and operations views

## Demo accounts

- Developer
  - Email: `dev@aegisbot.io`
  - Password: `DevPortal!23`
- User
  - Email: `user@aegisbot.io`
  - Password: `UserPortal!23`

Developer registration demo invite code:

- `AEGIS-DEV-ACCESS`

## Frontend setup

1. Install dependencies.
2. Start the Vite app with `npm run dev`.
3. Open the local URL shown by Vite.

## Bot setup

1. Fill in `.env` with your real Discord credentials.
2. Create a Discord application and bot in the Discord Developer Portal.
3. Copy the bot token into `DISCORD_BOT_TOKEN`.
4. Copy the application client ID into `DISCORD_CLIENT_ID`.
5. Add your own Discord user ID to `BOT_OWNER_ID`.
6. Optionally add a test guild ID to `DISCORD_GUILD_ID` for faster slash command registration.
7. Run the bot with your preferred TypeScript runtime or compile it into your backend stack.

## Suggested next steps for production

1. Replace local storage auth with a real backend and hashed passwords.
2. Add PostgreSQL + Redis for durable account, guild, billing, and session storage.
3. Move secrets into a vault service.
4. Add webhook verification, payment integration, and proper audit persistence.
5. Split the bot into modules for commands, events, automations, and billing.

## Zip export

The project files are ready to be zipped, but this environment does not provide an archive tool. To create a `.zip`, compress the project folder locally after downloading or copying it.