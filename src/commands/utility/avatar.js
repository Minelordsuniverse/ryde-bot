const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Image formats Discord supports; GIF only for animated avatars
const STATIC_FORMATS  = ["webp", "png", "jpg"];
const ANIMATED_FORMAT = "gif";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Show a user's avatar in full resolution with download links.")
    .addUserOption((o) =>
      o
        .setName("target")
        .setDescription("User whose avatar to show (defaults to you).")
        .setRequired(false)
    )
    .addBooleanOption((o) =>
      o
        .setName("server")
        .setDescription("Show their server-specific avatar if they have one.")
        .setRequired(false)
    ),

  async execute(interaction) {
    const target     = interaction.options.getUser("target") ?? interaction.user;
    const useServer  = interaction.options.getBoolean("server") ?? false;

    // Fetch full user object so we have the real avatar hash
    const fetched = await target.fetch();

    // (Optional) use guild avatar
    let member = null;
    if (useServer) {
      member = await interaction.guild.members.fetch(target.id).catch(() => null);
    }

    const isAnimated = member
      ? member.avatar?.startsWith("a_")
      : fetched.avatar?.startsWith("a_");

    const SIZE = 4096;

    // URLs for each format
    const formats = isAnimated
      ? [...STATIC_FORMATS, ANIMATED_FORMAT]
      : STATIC_FORMATS;

    const getUrl = (fmt) =>
      member?.displayAvatarURL({ extension: fmt, size: SIZE, forceStatic: fmt !== ANIMATED_FORMAT })
      ?? fetched.displayAvatarURL({ extension: fmt, size: SIZE, forceStatic: fmt !== ANIMATED_FORMAT });

    // Best display URL (gif preferred for animated, else png)
    const displayUrl = isAnimated ? getUrl("gif") : getUrl("png");

    const downloadLinks = formats
      .map((fmt) => `[\`${fmt.toUpperCase()}\`](${getUrl(fmt)})`)
      .join("  •  ");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(
        `${member ? member.displayName : fetched.username}'s ${useServer && member ? "Server " : ""}Avatar`
      )
      .setImage(displayUrl)
      .setDescription(`**Download:** ${downloadLinks}`)
      .addFields(
        { name: "User",      value: `${fetched.tag} (${fetched.id})`,  inline: true },
        { name: "Animated",  value: isAnimated ? "Yes (GIF)" : "No",   inline: true },
        { name: "Max Size",  value: `${SIZE}px`,                        inline: true }
      )
      .setFooter({ text: "Click a format link to open the full-resolution image." })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
