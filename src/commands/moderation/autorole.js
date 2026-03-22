const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { getConfig } = require("../../store");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("Manage roles automatically assigned to new members.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((s) =>
      s
        .setName("add")
        .setDescription("Add a role to the auto-assign list.")
        .addRoleOption((o) =>
          o.setName("role").setDescription("Role to auto-assign.").setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s
        .setName("remove")
        .setDescription("Remove a role from the auto-assign list.")
        .addRoleOption((o) =>
          o.setName("role").setDescription("Role to remove.").setRequired(true)
        )
    )
    .addSubcommand((s) =>
      s.setName("list").setDescription("List all auto-assigned roles.")
    )
    .addSubcommand((s) =>
      s.setName("clear").setDescription("Clear all auto-assigned roles.")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const config = getConfig(interaction.guild.id);

    if (sub === "add") {
      const role = interaction.options.getRole("role");

      if (role.managed) {
        return interaction.reply({
          content: "Bot-managed roles cannot be auto-assigned.",
          ephemeral: true,
        });
      }
      if (role.id === interaction.guild.id) {
        return interaction.reply({
          content: "@everyone cannot be auto-assigned.",
          ephemeral: true,
        });
      }
      if (config.defaultRoles.includes(role.id)) {
        return interaction.reply({
          content: `${role} is already in the auto-assign list.`,
          ephemeral: true,
        });
      }

      config.defaultRoles.push(role.id);
      return interaction.reply({
        content: `${role} will now be assigned to all new members.`,
      });
    }

    if (sub === "remove") {
      const role = interaction.options.getRole("role");
      const idx = config.defaultRoles.indexOf(role.id);
      if (idx === -1) {
        return interaction.reply({
          content: `${role} is not in the auto-assign list.`,
          ephemeral: true,
        });
      }
      config.defaultRoles.splice(idx, 1);
      return interaction.reply({ content: `${role} removed from auto-assign list.` });
    }

    if (sub === "list") {
      if (!config.defaultRoles.length) {
        return interaction.reply({
          content: "No auto-assigned roles configured.",
          ephemeral: true,
        });
      }
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("Auto-Assigned Roles")
        .setDescription(config.defaultRoles.map((id) => `<@&${id}>`).join("\n"))
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === "clear") {
      config.defaultRoles = [];
      return interaction.reply({ content: "All auto-assigned roles cleared." });
    }
  },
};
