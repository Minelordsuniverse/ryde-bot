const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Displays info about a user.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to look up (defaults to you).")
        .setRequired(false)
    ),

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const target = interaction.options.getUser("target") ?? interaction.user;
    const member = await interaction.guild.members
      .fetch(target.id)
      .catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle(`User Info — ${target.tag}`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setColor(0x5865f2)
      .addFields(
        { name: "ID", value: target.id, inline: true },
        {
          name: "Account Created",
          value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "Joined Server",
          value: member
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
            : "N/A",
          inline: true,
        },
        {
          name: "Roles",
          value:
            member?.roles.cache
              .filter((r) => r.id !== interaction.guild.id)
              .map((r) => `${r}`)
              .join(", ") || "None",
        }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
