const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { sendModLog } = require("../../utils/modLog");

// Helper: convert human-readable unit to milliseconds
const UNIT_MAP = {
  seconds: 1_000,
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout (mute) a member for a set duration.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName("target").setDescription("Member to timeout.").setRequired(true)
    )
    .addIntegerOption((o) =>
      o
        .setName("duration")
        .setDescription("Duration number.")
        .setMinValue(1)
        .setRequired(true)
    )
    .addStringOption((o) =>
      o
        .setName("unit")
        .setDescription("Unit of time (default: minutes).")
        .addChoices(
          { name: "Seconds", value: "seconds" },
          { name: "Minutes", value: "minutes" },
          { name: "Hours", value: "hours" },
          { name: "Days", value: "days" }
        )
        .setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the timeout.").setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember("target");
    const duration = interaction.options.getInteger("duration");
    const unit = interaction.options.getString("unit") ?? "minutes";
    const reason =
      interaction.options.getString("reason") ?? "No reason provided.";

    const ms = duration * UNIT_MAP[unit];

    // Discord cap: 28 days
    if (ms > 28 * 86_400_000) {
      return interaction.reply({
        content: "Timeout duration cannot exceed 28 days.",
        ephemeral: true,
      });
    }

    if (!target) {
      return interaction.reply({
        content: "That user is not in this server.",
        ephemeral: true,
      });
    }

    if (!target.moderatable) {
      return interaction.reply({
        content: "I can't timeout that member.",
        ephemeral: true,
      });
    }

    if (
      target.roles.highest.position >=
      interaction.member.roles.highest.position
    ) {
      return interaction.reply({
        content: "You can't timeout someone with an equal or higher role.",
        ephemeral: true,
      });
    }

    await target.timeout(ms, reason);

    const expiresAt = Math.floor((Date.now() + ms) / 1000);

    const embed = new EmbedBuilder()
      .setColor(0xeab308)
      .setTitle("Member Timed Out")
      .addFields(
        {
          name: "User",
          value: `${target.user.tag} (${target.id})`,
          inline: true,
        },
        { name: "Moderator", value: `${interaction.user.tag}`, inline: true },
        {
          name: "Duration",
          value: `${duration} ${unit} (expires <t:${expiresAt}:R>)`,
        },
        { name: "Reason", value: reason }
      )
      .setTimestamp();

    await sendModLog(interaction.guild, embed);
    await interaction.reply({ embeds: [embed] });
  },
};
