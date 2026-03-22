const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set or clear the slowmode for this channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((o) =>
      o
        .setName("seconds")
        .setDescription("Slowmode in seconds (0 to disable, max 21600).")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    ),

  async execute(interaction) {
    const seconds = interaction.options.getInteger("seconds");

    await interaction.channel.setRateLimitPerUser(
      seconds,
      `Set by ${interaction.user.tag}`
    );

    const embed = new EmbedBuilder()
      .setColor(0x6366f1)
      .setTitle("Slowmode Updated")
      .addFields(
        { name: "Channel", value: `${interaction.channel}`, inline: true },
        {
          name: "Slowmode",
          value: seconds === 0 ? "Disabled" : `${seconds}s`,
          inline: true,
        },
        { name: "Set By", value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
