# Ryde Bot

A (W.I.P) multipurpose discord bot made on djs v14.0

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Fill in DISCORD_TOKEN, CLIENT_ID, and optionally GUILD_ID
   ```

3. **Register slash commands**
   ```bash
   npm run deploy
   ```
   - With `GUILD_ID` set → registers instantly to that guild (great for dev).
   - Without `GUILD_ID` → registers globally (up to 1 hour propagation).

4. **Locally running an instance of the bot**
   ```bash
   npm start        # production
   npm run dev      # development (auto-restart via nodemon)
   ```
   - Note: This is only local instance. For proper hosting, use uptimerobot+repl.it or any other known server/ping sources.

## Adding a new command

Create a file inside `src/commands/<category>/yourcommand.js`:

```js
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Says hello!"),

  async execute(interaction) {
    await interaction.reply("Hello!");
  },
};
```

Then re-run `npm run deploy` to register it.

## Adding a new event

Create a file inside `src/events/eventName.js`:

```js
const { Events } = require("discord.js");

module.exports = {
  name: Events.MessageCreate,
  once: false, // true = fires only once

  async execute(message) {
    if (message.author.bot) return;
    // your logic here
  },
};
```

Note: event handler picks up registration automatically.
