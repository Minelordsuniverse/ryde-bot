const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Remove an active timeout from a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o
        .setName("target")
        .setDescription("Member to remove timeout from.")
        .setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason.").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const reason =
      interaction.options.getString("reason") ?? "No reason provided.";

    if (!target) {
      return interaction.reply({
        content: "That user is not in this server.",
        ephemeral: true,
      });
    }

    if (!target.isCommunicationDisabled()) {
      return interaction.reply({
        content: "That member is not currently timed out.",
        ephemeral: true,
      });
    }

    await target.timeout(null, reason); // null removes the timeout

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("Timeout Removed")
      .addFields(
        {
          name: "User",
          value: `${target.user.tag} (${target.id})`,
          inline: true,
        },
        { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
