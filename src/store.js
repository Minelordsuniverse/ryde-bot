/**
 * Shared mem store for all (configurable) features.
 * In production, replace with any db like SQLite or MongoDB
 *
 * Structure:
 *   guildConfig  : Map<guildId, GuildConfig>
 *   warnings     : Map<guildId, Map<userId, Warning[]>>
 *   reactionRoles: Map<guildId, Map<messageId, Map<emoji, roleId>>>
 *   starboard    : Map<guildId, Set<messageId>>  — already-posted messages
 */

const guildConfig = new Map();
const warnings    = new Map();
const reactionRoles = new Map();
const starboardPosted = new Map(); // tracks which msgs are already on starboard

// Helpers

function getConfig(guildId) {
  if (!guildConfig.has(guildId)) {
    guildConfig.set(guildId, {
      // Mod logs
      modLogChannel: null,

      // Auto / default roles
      defaultRoles: [],          // array of role IDs assigned on join

      // Welcome
      welcomeEnabled: false,
      welcomeChannel: null,
      welcomeMessage: "Welcome to the server, {user}! 🎉",

      // Starboard
      starboardChannel: null,
      starboardThreshold: 3,

      // Reaction roles are stored separately in reactionRoles map
    });
  }
  return guildConfig.get(guildId);
}

function getWarnings(guildId, userId) {
  if (!warnings.has(guildId)) warnings.set(guildId, new Map());
  const guild = warnings.get(guildId);
  if (!guild.has(userId)) guild.set(userId, []);
  return guild.get(userId);
}

function getReactionRoles(guildId) {
  if (!reactionRoles.has(guildId)) reactionRoles.set(guildId, new Map());
  return reactionRoles.get(guildId);
}

function getStarboardPosted(guildId) {
  if (!starboardPosted.has(guildId)) starboardPosted.set(guildId, new Set());
  return starboardPosted.get(guildId);
}

module.exports = { getConfig, getWarnings, getReactionRoles, getStarboardPosted };
