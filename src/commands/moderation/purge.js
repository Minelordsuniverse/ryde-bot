const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Bulk-delete messages in this channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((o) =>
      o
        .setName("amount")
        .setDescription("Number of messages to delete (1–100).")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption((o) =>
      o
        .setName("target")
        .setDescription("Only delete messages from this user.")
        .setRequired(false)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    const filterUser = interaction.options.getUser("target");

    await interaction.deferReply({ ephemeral: true });

    // Fetch messages (max 100) + Discord won't bulk delete messages older than 14 days old)
    const messages = await interaction.channel.messages.fetch({
      limit: 100,
    });

    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

    let toDelete = [...messages.values()]
      .filter((m) => m.createdTimestamp > twoWeeksAgo) // skip old messages
      .filter((m) => (filterUser ? m.author.id === filterUser.id : true))
      .slice(0, amount);

    if (toDelete.length === 0) {
      return interaction.editReply(
        "No eligible messages found (messages older than 14 days cannot be bulk-deleted)."
      );
    }

    const deleted = await interaction.channel.bulkDelete(toDelete, true);

    const embed = new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle("Messages Purged")
      .addFields(
        { name: "Deleted", value: `${deleted.size} message(s)`, inline: true },
        { name: "Channel", value: `${interaction.channel}`, inline: true },
        {
          name: "Filter",
          value: filterUser ? `${filterUser.tag}` : "None",
          inline: true,
        },
        { name: "Moderator", value: `${interaction.user.tag}`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
