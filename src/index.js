const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
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
    GatewayIntentBits.GuildMessageReactions, // required for reaction roles & starboard
  ],
  // Partials allow the bot to receive reaction events on messages
  // that weren't cached when the bot started (e.g. older messages)
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Attach a commands Collection to the client for easy access across handlers
client.commands = new Collection();

// Load Handlers
loadCommands(client);
loadEvents(client);

// Login
client.login(token);
