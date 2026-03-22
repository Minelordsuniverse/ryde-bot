const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const { getConfig } = require("../../store");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Configure the welcome message system.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((s) =>
      s
        .setName("enable")
        .setDescription("Enable welcome messages and set the channel.")
        .addChannelOption((o) =>
          o
            .setName("channel")
            .setDescription("Channel to send welcome messages in.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s.setName("disable").setDescription("Disable welcome messages.")
    )
    .addSubcommand((s) =>
      s
        .setName("message")
        .setDescription("Set a custom welcome message.")
        .addStringOption((o) =>
          o
            .setName("text")
            .setDescription(
              "Message text. Use {user} for mention, {username} for name, {server} for server name."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s.setName("test").setDescription("Preview the welcome message for yourself.")
    )
    .addSubcommand((s) =>
      s.setName("status").setDescription("Show current welcome configuration.")
    ),

  async execute(interaction) {
    const sub    = interaction.options.getSubcommand();
    const config = getConfig(interaction.guild.id);

    if (sub === "enable") {
      const channel = interaction.options.getChannel("channel");
      config.welcomeEnabled = true;
      config.welcomeChannel = channel.id;
      return interaction.reply({
        content: `Welcome messages enabled in ${channel}.`,
      });
    }

    if (sub === "disable") {
      config.welcomeEnabled = false;
      return interaction.reply({ content: "Welcome messages disabled." });
    }

    if (sub === "message") {
      const text = interaction.options.getString("text");
      config.welcomeMessage = text;
      return interaction.reply({
        content: `Welcome message updated.\n> ${text}`,
        ephemeral: true,
      });
    }

    if (sub === "test") {
      const preview = buildWelcomeMessage(config.welcomeMessage, interaction.member);
      const embed = buildWelcomeEmbed(interaction.member, preview);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === "status") {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("Welcome Configuration")
        .addFields(
          { name: "Enabled",  value: config.welcomeEnabled ? "Yes" : "No",                              inline: true },
          { name: "Channel",  value: config.welcomeChannel ? `<#${config.welcomeChannel}>` : "Not set", inline: true },
          { name: "Message",  value: config.welcomeMessage }
        )
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

// Helpers

function buildWelcomeMessage(template, member) {
  return template
    .replace("{user}",     `${member}`)
    .replace("{username}", member.user.username)
    .replace("{server}",   member.guild.name);
}

function buildWelcomeEmbed(member, message) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`Welcome to ${member.guild.name}!`)
    .setDescription(message)
    .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
    .setFooter({
      text: `Member #${member.guild.memberCount}`,
    })
    .setTimestamp();
}

module.exports.buildWelcomeMessage = buildWelcomeMessage;
module.exports.buildWelcomeEmbed   = buildWelcomeEmbed;
