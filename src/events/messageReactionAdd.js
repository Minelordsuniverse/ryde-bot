const { Events, EmbedBuilder } = require("discord.js");
const { getReactionRoles, getConfig, getStarboardPosted } = require("../store");

module.exports = {
  name: Events.MessageReactionAdd,

  /**
   * @param {import("discord.js").MessageReaction} reaction
   * @param {import("discord.js").User} user
   */
  async execute(reaction, user) {
    if (user.bot) return;

    // Fetch partial reaction / message if not yet cached
    if (reaction.partial) {
      await reaction.fetch().catch(console.error);
    }
    if (reaction.message.partial) {
      await reaction.message.fetch().catch(console.error);
    }

    const { guild } = reaction.message;
    if (!guild) return;

    // Reaction Roles
    await handleReactionRole(reaction, user, guild, true);

    // Starboard
    if (reaction.emoji.name === "⭐") {
      await handleStarboard(reaction, guild);
    }
  },
};

// Reaction Role Helper

async function handleReactionRole(reaction, user, guild, isAdd) {
  const rrMap   = getReactionRoles(guild.id);
  const msgMap  = rrMap.get(reaction.message.id);
  if (!msgMap) return;

  // Match by unicode emoji name or custom emoji id
  const emojiKey =
    reaction.emoji.id ?? reaction.emoji.name;

  const roleId = msgMap.get(emojiKey) ?? msgMap.get(reaction.emoji.name);
  if (!roleId) return;

  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;

  const role = guild.roles.cache.get(roleId);
  if (!role) return;

  if (isAdd) {
    if (!member.roles.cache.has(roleId)) {
      await member.roles.add(role, "Reaction role").catch(console.error);
    }
  } else {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(role, "Reaction role removed").catch(console.error);
    }
  }
}

// Starboard Helper

async function handleStarboard(reaction, guild) {
  const config    = getConfig(guild.id);
  const posted    = getStarboardPosted(guild.id);

  if (!config.starboardChannel) return;

  const starCount = reaction.count;
  if (starCount < config.starboardThreshold) return;

  const msg = reaction.message;

  // Don't re-post if already on the starboard
  if (posted.has(msg.id)) return;

  // Don't post if the message IS in the starboard channel
  if (msg.channel.id === config.starboardChannel) return;

  const sbChannel = guild.channels.cache.get(config.starboardChannel);
  if (!sbChannel) return;

  posted.add(msg.id);

  // Build embed - handle image attachments gracefully
  const image = msg.attachments.find((a) =>
    a.contentType?.startsWith("image/")
  );

  const embed = new EmbedBuilder()
    .setColor(0xf59e0b)
    .setAuthor({
      name: msg.author.tag,
      iconURL: msg.author.displayAvatarURL({ size: 64 }),
    })
    .setDescription(msg.content || null)
    .addFields(
      { name: "Channel", value: `${msg.channel}`, inline: true },
      { name: "Link",    value: `[Jump to message](${msg.url})`, inline: true }
    )
    .setFooter({ text: `⭐ ${starCount}  •  ${msg.id}` })
    .setTimestamp(msg.createdAt);

  if (image) embed.setImage(image.url);

  await sbChannel
    .send({ content: `⭐ **${starCount}** ${msg.channel}`, embeds: [embed] })
    .catch(console.error);
}

// Export helpers so messageReactionRemove can reuse them
module.exports.handleReactionRole = handleReactionRole;
