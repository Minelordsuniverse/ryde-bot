const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js");
const { getConfig } = require("../../store");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modlog")
    .setDescription("Configure the mod-log channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) =>
      s
        .setName("set")
        .setDescription("Set the channel where mod actions are logged.")
        .addChannelOption((o) =>
          o
            .setName("channel")
            .setDescription("The text channel to use.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s.setName("clear").setDescription("Disable mod logging.")
    )
    .addSubcommand((s) =>
      s.setName("status").setDescription("Show the current mod-log channel.")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const config = getConfig(interaction.guild.id);

    if (sub === "set") {
      const channel = interaction.options.getChannel("channel");
      config.modLogChannel = channel.id;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("Mod Log Channel Set")
        .setDescription(`All moderation actions will now be logged in ${channel}.`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "clear") {
      config.modLogChannel = null;
      return interaction.reply({
        content: "Mod logging has been disabled.",
        ephemeral: true,
      });
    }

    if (sub === "status") {
      const ch = config.modLogChannel
        ? `<#${config.modLogChannel}>`
        : "Not configured";
      return interaction.reply({
        content: `Current mod-log channel: **${ch}**`,
        ephemeral: true,
      });
    }
  },
};
