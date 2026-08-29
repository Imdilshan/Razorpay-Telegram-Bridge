const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  whatsappNumber: {
    type: String,
    required: true,
    unique: true,
  },
  razorpayKeyId: {
    type: String,
    required: true,
  },
  razorpayKeySecretEncrypted: {
    type: String,
    required: true,
  },
  linkedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Merchant', merchantSchema);