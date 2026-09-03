const Merchant = require('./merchant.model');
const { encrypt } = require('../../lib/encryption');

const KEY_ID_PATTERN = /^rzp_test_[A-Za-z0-9]+$/;
const RESERVED_WORDS = ['connect', 'start', 'disconnect', 'logout', 'help', 'cancel'];

function isValidKeyId(text) {
  return KEY_ID_PATTERN.test(text.trim());
}

function isValidKeySecret(text) {
  const trimmed = text.trim();
  return trimmed.length >= 8 && !RESERVED_WORDS.includes(trimmed.toLowerCase());
}

function isConnected(merchant) {
  return !!(merchant && merchant.keySecretEncrypted);
}

async function findMerchant(telegramChatId) {
  return Merchant.findOne({ telegramChatId });
}

async function startOnboarding(telegramChatId) {
  return Merchant.findOneAndUpdate(
    { telegramChatId },
    { $set: { onboardingState: 'awaiting_key_id', pendingKeyId: null } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function setPendingKeyId(telegramChatId, keyId) {
  return Merchant.findOneAndUpdate(
    { telegramChatId },
    { $set: { onboardingState: 'awaiting_key_secret', pendingKeyId: keyId } },
    { new: true }
  );
}

// NOTE: Collecting the Razorpay Key Secret via plain Telegram text is acceptable here
// because this is a demo wired to test-mode keys only. A production onboarding flow
// should collect secrets through an authenticated HTTPS web form, not a chat message.
async function completeOnboarding(telegramChatId, keySecretPlain) {
  const merchant = await Merchant.findOne({ telegramChatId });
  merchant.keyId = merchant.pendingKeyId;
  merchant.keySecretEncrypted = encrypt(keySecretPlain);
  merchant.onboardingState = null;
  merchant.pendingKeyId = null;
  return merchant.save();
}

async function resetOnboarding(telegramChatId) {
  return Merchant.findOneAndUpdate(
    { telegramChatId },
    { $set: { onboardingState: null, pendingKeyId: null } },
    { new: true }
  );
}

async function disconnectMerchant(telegramChatId) {
  return Merchant.deleteOne({ telegramChatId });
}

module.exports = {
  isValidKeyId,
  isValidKeySecret,
  isConnected,
  findMerchant,
  startOnboarding,
  setPendingKeyId,
  completeOnboarding,
  resetOnboarding,
  disconnectMerchant,
};