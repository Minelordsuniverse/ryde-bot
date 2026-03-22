const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const { getConfig } = require("../../store");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("starboard")
    .setDescription("Configure the starboard.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) =>
      s
        .setName("set")
        .setDescription("Set the starboard channel.")
        .addChannelOption((o) =>
          o
            .setName("channel")
            .setDescription("Channel where starred messages appear.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("threshold")
        .setDescription("Set how many ⭐ reactions are needed.")
        .addIntegerOption((o) =>
          o
            .setName("count")
            .setDescription("Number of stars required (min 1).")
            .setMinValue(1)
            .setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s.setName("disable").setDescription("Disable the starboard.")
    )
    .addSubcommand((s) =>
      s.setName("status").setDescription("Show current starboard configuration.")
    ),

  async execute(interaction) {
    const sub    = interaction.options.getSubcommand();
    const config = getConfig(interaction.guild.id);

    if (sub === "set") {
      const channel = interaction.options.getChannel("channel");
      config.starboardChannel = channel.id;
      return interaction.reply({
        content: `Starboard channel set to ${channel}. Threshold: **${config.starboardThreshold}** ⭐`,
      });
    }

    if (sub === "threshold") {
      const count = interaction.options.getInteger("count");
      config.starboardThreshold = count;
      return interaction.reply({
        content: `Starboard threshold set to **${count}** ⭐`,
      });
    }

    if (sub === "disable") {
      config.starboardChannel = null;
      return interaction.reply({ content: "Starboard disabled." });
    }

    if (sub === "status") {
      const embed = new EmbedBuilder()
        .setColor(0xf59e0b)
        .setTitle("⭐ Starboard Configuration")
        .addFields(
          {
            name: "Channel",
            value: config.starboardChannel
              ? `<#${config.starboardChannel}>`
              : "Not configured",
            inline: true,
          },
          {
            name: "Threshold",
            value: `${config.starboardThreshold} ⭐`,
            inline: true,
          }
        )
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
