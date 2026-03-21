const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { getWarnings } = require("../../store");
const { sendModLog } = require("../../utils/modLog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Issue a warning to a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("target").setDescription("Member to warn.").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the warning.").setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const reason = interaction.options.getString("reason");

    if (!target)          return interaction.reply({ content: "User not in server.", ephemeral: true });
    if (target.user.bot) return interaction.reply({ content: "You can't warn a bot.", ephemeral: true });

    const userWarnings = getWarnings(interaction.guild.id, target.id);
    const entry = {
      id: userWarnings.length + 1,
      reason,
      moderator: interaction.user.tag,
      timestamp: new Date().toISOString(),
    };
    userWarnings.push(entry);

    await target.user
      .send(`⚠️ You received a warning in **${interaction.guild.name}**.\n> **Reason:** ${reason}\n> Total warnings: **${userWarnings.length}**`)
      .catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(0xeab308).setTitle("Member Warned")
      .addFields(
        { name: "User",           value: `${target.user.tag} (${target.id})`, inline: true },
        { name: "Moderator",      value: interaction.user.tag,                inline: true },
        { name: "Total Warnings", value: `${userWarnings.length}`,            inline: true },
        { name: "Reason",         value: reason }
      ).setTimestamp();

    await sendModLog(interaction.guild, embed);
    await interaction.reply({ embeds: [embed] });
  },
};
