const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with the bot latency."),

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   * @param {import("discord.js").Client} client
   */
  async execute(interaction, client) {
    const sent = await interaction.reply({
      content: "Pinging…",
      fetchReply: true,
    });

    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsHeartbeat = client.ws.ping;

    await interaction.editReply(
      `Pong!\n> Roundtrip: **${roundtrip}ms** | WebSocket: **${wsHeartbeat}ms**`
    );
  },
};
