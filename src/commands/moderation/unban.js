const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user by their ID.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((o) =>
      o.setName("user_id").setDescription("ID of the user to unban.").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the unban.").setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.options.getString("user_id");
    const reason =
      interaction.options.getString("reason") ?? "No reason provided.";

    // Verify they're actually banned
    const banEntry = await interaction.guild.bans
      .fetch(userId)
      .catch(() => null);

    if (!banEntry) {
      return interaction.reply({
        content: `No ban found for user ID \`${userId}\`.`,
        ephemeral: true,
      });
    }

    await interaction.guild.members.unban(userId, reason);

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("User Unbanned")
      .addFields(
        {
          name: "User",
          value: `${banEntry.user.tag} (${userId})`,
          inline: true,
        },
        { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
