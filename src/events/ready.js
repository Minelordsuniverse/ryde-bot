const { Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true, // fires only once when bot starts

  /**
   * @param {import("discord.js").Client} client
   */
  execute(client) {
    console.log(`[Ready] Logged in as ${client.user.tag}`);
    console.log(`[Ready] Serving ${client.guilds.cache.size} guild(s).`);

    client.user.setActivity("slash commands", { type: 3 }); // type 3 = Watching
  },
};
