/**
 * Run this once (or whenever commands change) to register slash commands.
 *
 * Global: node src/deploy-commands.js
 * Guild: Set GUILD_ID in .env for instant registration during development.
 */

const { REST, Routes, readdirSync } = require("discord.js");
const { join } = require("path");
require("dotenv").config();

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

// Collect all command data
const commands = [];
const commandsPath = join(__dirname, "commands");

for (const category of readdirSync(commandsPath)) {
  const categoryPath = join(commandsPath, category);
  for (const file of readdirSync(categoryPath).filter((f) =>
    f.endsWith(".js")
  )) {
    const command = require(join(categoryPath, file));
    if (command?.data) commands.push(command.data.toJSON());
  }
}

// Register via REST
const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Registering ${commands.length} slash command(s)…`);

    const route = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) // guild (instant)
      : Routes.applicationCommands(CLIENT_ID); // global (up to 1 hr propagation)

    const data = await rest.put(route, { body: commands });

    console.log(
      `Successfully registered ${data.length} command(s) ${
        GUILD_ID ? `to guild ${GUILD_ID}` : "globally"
      }.`
    );
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
})();
