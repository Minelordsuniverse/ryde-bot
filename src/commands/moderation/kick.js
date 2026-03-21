const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { sendModLog } = require("../../utils/modLog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((o) =>
      o.setName("target").setDescription("Member to kick.").setRequired(true)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the kick.").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const reason =
      interaction.options.getString("reason") ?? "No reason provided.";

    // Guards
    if (!target) {
      return interaction.reply({
        content: "That user is not in this server.",
        ephemeral: true,
      });
    }

    if (!target.kickable) {
      return interaction.reply({
        content:
          "I can't kick that member — they may have a higher role than me.",
        ephemeral: true,
      });
    }

    if (
      target.roles.highest.position >=
      interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content: "You can't kick someone with an equal or higher role.",
        ephemeral: true,
      });
    }

    // DM the target before kicking
    await target.user
      .send(
        `You have been **kicked** from **${interaction.guild.name}**.\n> **Reason:** ${reason}`
      )
      .catch(() => null); // silently ignore if DMs are closed

    await target.kick(reason);

    const embed = new EmbedBuilder()
      .setColor(0xf97316)
      .setTitle("Member Kicked")
      .addFields(
        { name: "User", value: `${target.user.tag} (${target.id})`, inline: true },
        { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    await sendModLog(interaction.guild, embed);
    await interaction.reply({ embeds: [embed] });
  },
};
