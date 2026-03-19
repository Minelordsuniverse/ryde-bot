const { readdirSync } = require("fs");
const { join } = require("path");

/**
 * Recursively loads all command files from /commands directory
 * and registers them on client.commands (a Collection).
 *
 * @param {import("discord.js").Client} client
 */
function loadCommands(client) {
  const commandsPath = join(__dirname, "..", "commands");
  const categories = readdirSync(commandsPath);

  let loaded = 0;

  for (const category of categories) {
    const categoryPath = join(commandsPath, category);
    const commandFiles = readdirSync(categoryPath).filter((f) =>
      f.endsWith(".js")
    );

    for (const file of commandFiles) {
      const command = require(join(categoryPath, file));

      if (!command?.data || !command?.execute) {
        console.warn(
          `[CommandHandler] Skipping ${file} — missing "data" or "execute".`
        );
        continue;
      }

      client.commands.set(command.data.name, command);
      loaded++;
    }
  }

  console.log(`[CommandHandler] Loaded ${loaded} command(s).`);
}

module.exports = { loadCommands };
