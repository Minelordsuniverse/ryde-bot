const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock a channel so @everyone cannot send messages.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((o) =>
      o
        .setName("channel")
        .setDescription("Channel to lock (defaults to current).")
        .setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the lock.").setRequired(false)
    ),

  async execute(interaction) {
    const channel =
      interaction.options.getChannel("channel") ?? interaction.channel;
    const reason =
      interaction.options.getString("reason") ?? "No reason provided.";

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false,
    });

    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle("Channel Locked")
      .addFields(
        { name: "Channel", value: `${channel}`, inline: true },
        { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
