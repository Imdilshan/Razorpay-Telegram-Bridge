const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  telegramChatId: {
    type: String,
    required: true,
    unique: true,
  },
  keyId: {
    type: String,
    default: null,
  },
  keySecretEncrypted: {
    type: String,
    default: null,
  },
  onboardingState: {
    type: String,
    enum: ['awaiting_key_id', 'awaiting_key_secret', null],
    default: null,
  },
  pendingKeyId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Merchant', merchantSchema);