const { Events } = require("discord.js");
const { handleReactionRole } = require("./messageReactionAdd");

module.exports = {
  name: Events.MessageReactionRemove,

  /**
   * @param {import("discord.js").MessageReaction} reaction
   * @param {import("discord.js").User} user
   */
  async execute(reaction, user) {
    if (user.bot) return;

    if (reaction.partial) await reaction.fetch().catch(console.error);
    if (reaction.message.partial) await reaction.message.fetch().catch(console.error);

    const { guild } = reaction.message;
    if (!guild) return;

    // isAdd = false → remove the role
    await handleReactionRole(reaction, user, guild, false);
  },
};
