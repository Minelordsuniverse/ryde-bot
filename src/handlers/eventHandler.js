const { readdirSync } = require("fs");
const { join } = require("path");

/**
 * Dynamically loads all event files from /events directory
 * and binds them to the client using on() or once().
 *
 * @param {import("discord.js").Client} client
 */
function loadEvents(client) {
  const eventsPath = join(__dirname, "..", "events");
  const eventFiles = readdirSync(eventsPath).filter((f) => f.endsWith(".js"));

  let loaded = 0;

  for (const file of eventFiles) {
    const event = require(join(eventsPath, file));

    if (!event?.name || !event?.execute) {
      console.warn(
        `[EventHandler] Skipping ${file} — missing "name" or "execute".`
      );
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    loaded++;
  }

  console.log(`[EventHandler] Registered ${loaded} event(s).`);
}

module.exports = { loadEvents };
