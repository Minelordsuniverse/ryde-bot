const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { token } = require("../config/config");
const { loadCommands } = require("./handlers/commandHandler");
const { loadEvents } = require("./handlers/eventHandler");

// Client Instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Attach commands collection to client for easy access across handlers
client.commands = new Collection();

// Load Handlers
loadCommands(client);
loadEvents(client);

// Login
client.login(token);
