const mongoose = require('mongoose');

const LINK_SESSION_TTL_SECONDS = 600; 

const linkSessionSchema = new mongoose.Schema({
  whatsappNumber: {
    type: String,
    required: true,
    unique: true,
  },
  step: {
    type: String,
    enum: [
      'awaiting_key_id',
      'awaiting_secret',
      'confirm_relink_intent',
      'confirm_relink_final',
    ],
    required: true,
  },
  keyId: {
    type: String,
    default: null,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: LINK_SESSION_TTL_SECONDS,
  },
});

module.exports = mongoose.model('LinkSession', linkSessionSchema);