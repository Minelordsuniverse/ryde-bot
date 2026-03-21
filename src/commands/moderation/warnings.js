const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { getWarnings } = require("../../store");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View warnings for a member.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("target").setDescription("Member to check.").setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("target");
    const userWarnings = getWarnings(interaction.guild.id, target.id);

    if (!userWarnings.length) {
      return interaction.reply({ content: ` **${target.tag}** has no warnings.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xeab308)
      .setTitle(`Warnings for ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ size: 64 }))
      .setDescription(
        userWarnings.map((w) =>
          `**#${w.id}** — ${w.reason}\n> By ${w.moderator} • <t:${Math.floor(new Date(w.timestamp).getTime() / 1000)}:R>`
        ).join("\n\n")
      )
      .setFooter({ text: `Total: ${userWarnings.length} warning(s)` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
