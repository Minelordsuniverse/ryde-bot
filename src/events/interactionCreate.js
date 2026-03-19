const { Events, MessageFlags } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param {import("discord.js").Interaction} interaction
   * @param {import("discord.js").Client} client
   */
  async execute(interaction, client) {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.warn(
          `[InteractionCreate] Unknown command: ${interaction.commandName}`
        );
        return interaction.reply({
          content: "Unknown command.",
          flags: MessageFlags.Ephemeral,
        });
      }

      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(
          `[InteractionCreate] Error executing ${interaction.commandName}:`,
          err
        );

        const errorPayload = {
          content: "An error occurred while running this command.",
          flags: MessageFlags.Ephemeral,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorPayload);
        } else {
          await interaction.reply(errorPayload);
        }
      }
    }

    // Autocomplete
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command?.autocomplete) return;

      try {
        await command.autocomplete(interaction, client);
      } catch (err) {
        console.error("[InteractionCreate] Autocomplete error:", err);
      }
    }
  },
};
