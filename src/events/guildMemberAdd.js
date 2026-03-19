const { Events } = require("discord.js");

module.exports = {
  name: Events.GuildMemberAdd,

  /**
   * @param {import("discord.js").GuildMember} member
   */
  async execute(member) {
    console.log(`[GuildMemberAdd] ${member.user.tag} joined ${member.guild.name}`);

    // Example: send a welcome message in a specific channel
    // const channel = member.guild.channels.cache.find(c => c.name === "welcome");
    // if (channel) channel.send(`Welcome to the server, ${member}!`);
  },
};
