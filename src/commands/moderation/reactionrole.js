const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");
const { getReactionRoles } = require("../../store");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Manage reaction roles on a message.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((s) =>
      s
        .setName("add")
        .setDescription("Bind an emoji reaction on a message to a role.")
        .addStringOption((o) =>
          o
            .setName("message_id")
            .setDescription("ID of the message to attach the reaction to.")
            .setRequired(true)
        )
        .addStringOption((o) =>
          o
            .setName("emoji")
            .setDescription("Emoji to react with (unicode or custom emoji ID).")
            .setRequired(true)
        )
        .addRoleOption((o) =>
          o
            .setName("role")
            .setDescription("Role to assign/remove when the emoji is clicked.")
            .setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("remove")
        .setDescription("Remove a reaction-role binding.")
        .addStringOption((o) =>
          o.setName("message_id").setDescription("Message ID.").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("emoji").setDescription("Emoji to unbind.").setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("list")
        .setDescription("List all reaction-role bindings for a message.")
        .addStringOption((o) =>
          o.setName("message_id").setDescription("Message ID.").setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("panel")
        .setDescription("Post a new reaction-role panel embed in this channel.")
        .addStringOption((o) =>
          o.setName("title").setDescription("Panel title.").setRequired(true)
        )
        .addStringOption((o) =>
          o
            .setName("description")
            .setDescription("Instructions shown on the panel.")
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const rrMap = getReactionRoles(interaction.guild.id); // Map<messageId, Map<emoji, roleId>>

    // Panel
    if (sub === "panel") {
      const title = interaction.options.getString("title");
      const description =
        interaction.options.getString("description") ??
        "React below to assign yourself a role!";

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: "React to this message to get a role." });

      const msg = await interaction.channel.send({ embeds: [embed] });

      await interaction.reply({
        content: `Reaction-role panel created. Use \`/reactionrole add message_id:${msg.id}\` to bind emojis.`,
        ephemeral: true,
      });
      return;
    }

    // Add
    if (sub === "add") {
      const messageId = interaction.options.getString("message_id");
      const emoji     = interaction.options.getString("emoji");
      const role      = interaction.options.getRole("role");

      // Fetch message to verify it exists and add the reaction
      const message = await interaction.channel.messages
        .fetch(messageId)
        .catch(() => null);

      if (!message) {
        return interaction.reply({
          content: "Message not found in this channel.",
          ephemeral: true,
        });
      }

      if (!rrMap.has(messageId)) rrMap.set(messageId, new Map());
      rrMap.get(messageId).set(emoji, role.id);

      // React to the message so users know which emoji to use
      await message.react(emoji).catch(() => null);

      return interaction.reply({
        content: `Reacting with ${emoji} on that message will now toggle ${role}.`,
        ephemeral: true,
      });
    }

    // Remove
    if (sub === "remove") {
      const messageId = interaction.options.getString("message_id");
      const emoji     = interaction.options.getString("emoji");

      const msgBindings = rrMap.get(messageId);
      if (!msgBindings?.has(emoji)) {
        return interaction.reply({
          content: "No binding found for that emoji on that message.",
          ephemeral: true,
        });
      }

      msgBindings.delete(emoji);
      if (msgBindings.size === 0) rrMap.delete(messageId);

      return interaction.reply({
        content: `Removed the ${emoji} binding from message \`${messageId}\`.`,
        ephemeral: true,
      });
    }

    // List
    if (sub === "list") {
      const messageId  = interaction.options.getString("message_id");
      const msgBindings = rrMap.get(messageId);

      if (!msgBindings?.size) {
        return interaction.reply({
          content: "No reaction-role bindings found for that message.",
          ephemeral: true,
        });
      }

      const lines = [...msgBindings.entries()].map(
        ([emoji, roleId]) => `${emoji} → <@&${roleId}>`
      );

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`Reaction Roles — \`${messageId}\``)
        .setDescription(lines.join("\n"))
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
