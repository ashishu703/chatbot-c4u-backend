// Utility for chat expiry/truth checking

const PLATFORM_EXPIRY = {
  whatsapp: 24 * 60 * 60 * 1000, // 24 hours in ms
  messenger: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  instagram: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

function isChatActive(chat) {
  if (!chat.platform || !chat.last_message_timestamp) return true;
  const now = Date.now();
  const expiry = PLATFORM_EXPIRY[chat.platform.toLowerCase()];
  if (!expiry) return true; // unknown platform, allow by default
  return now - Number(chat.last_message_timestamp) < expiry;
}

function getChatExpiryMs(chat) {
  if (!chat.platform) return null;
  return PLATFORM_EXPIRY[chat.platform.toLowerCase()] || null;
}

module.exports = { isChatActive, getChatExpiryMs, PLATFORM_EXPIRY };
