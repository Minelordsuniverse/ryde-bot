const { EmbedBuilder } = require("discord.js");
const { getConfig } = require("../store");

/**
 * Sends a mod-log embed to the configured channel (if set).
 *
 * @param {import("discord.js").Guild} guild
 * @param {import("discord.js").EmbedBuilder|object} embedOrData
 *   Pass a ready EmbedBuilder, or a plain object:
 *   { color, title, fields, description }
 */
async function sendModLog(guild, embedOrData) {
  const { modLogChannel } = getConfig(guild.id);
  if (!modLogChannel) return;

  const channel = guild.channels.cache.get(modLogChannel);
  if (!channel) return;

  const embed =
    embedOrData instanceof EmbedBuilder
      ? embedOrData
      : new EmbedBuilder()
          .setColor(embedOrData.color ?? 0x5865f2)
          .setTitle(embedOrData.title ?? "Mod Log")
          .setDescription(embedOrData.description ?? null)
          .addFields(...(embedOrData.fields ?? []))
          .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(console.error);
}

module.exports = { sendModLog };
