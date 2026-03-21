const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock a channel so @everyone can send messages again.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((o) =>
      o
        .setName("channel")
        .setDescription("Channel to unlock (defaults to current).")
        .setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the unlock.").setRequired(false)
    ),

  async execute(interaction) {
    const channel =
      interaction.options.getChannel("channel") ?? interaction.channel;
    const reason =
      interaction.options.getString("reason") ?? "No reason provided.";

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null, // null = resets to role default
    });

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("Channel Unlocked")
      .addFields(
        { name: "Channel", value: `${channel}`, inline: true },
        { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
