const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { sendModLog } = require("../../utils/modLog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) =>
      o.setName("target").setDescription("Member to ban.").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the ban.").setRequired(false)
    )
    .addIntegerOption((o) =>
      o
        .setName("delete_days")
        .setDescription("Days of messages to delete (0–7).")
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const targetUser = interaction.options.getUser("target");
    const reason =
      interaction.options.getString("reason") ?? "No reason provided.";
    const deleteDays = interaction.options.getInteger("delete_days") ?? 0;

    // Guards
    if (target) {
      if (!target.bannable) {
        return interaction.reply({
          content:
            "I can't ban that member — they may have a higher role than me.",
          ephemeral: true,
        });
      }

      if (
        target.roles.highest.position >=
        interaction.member.roles.highest.position
      ) {
        return interaction.reply({
          content: "You can't ban someone with an equal or higher role.",
          ephemeral: true,
        });
      }

      // DM before banning (will fail once banned)
      await target.user
        .send(
          `You have been **banned** from **${interaction.guild.name}**.\n> **Reason:** ${reason}`
        )
        .catch(() => null);
    }

    // Ban by user ID even if they're not in the server (hackban)
    await interaction.guild.members.ban(targetUser.id, {
      reason,
      deleteMessageDays: deleteDays,
    });

    const embed = new EmbedBuilder()
      .setColor(0xef4444)
      .setTitle("Member Banned")
      .addFields(
        {
          name: "User",
          value: `${targetUser.tag} (${targetUser.id})`,
          inline: true,
        },
        { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
        { name: "Reason", value: reason },
        {
          name: "Messages Deleted",
          value: `${deleteDays} day(s)`,
          inline: true,
        }
      )
      .setTimestamp();

    await sendModLog(interaction.guild, embed);
    await interaction.reply({ embeds: [embed] });
  },
};
