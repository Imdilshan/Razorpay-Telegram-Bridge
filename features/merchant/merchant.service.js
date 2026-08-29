const Merchant = require('./merchant.model');
const { encrypt } = require('../../lib/encryption');

const KEY_ID_PATTERN = /^rzp_test_[A-Za-z0-9]+$/;
const RESERVED_WORDS = ['cancel', 'help', 'link', 'yes', 'no', 'confirm'];

function isValidKeyId(text) {
  return KEY_ID_PATTERN.test(text.trim());
}

function isValidKeySecret(text) {
  const trimmed = text.trim();
  return trimmed.length >= 8 && !RESERVED_WORDS.includes(trimmed.toLowerCase());
}

function maskKeyId(keyId) {
  if (!keyId || keyId.length < 13) return 'rzp_test_****';
  return `${keyId.slice(0, 13)}...`;
}

async function findMerchant(whatsappNumber) {
  return Merchant.findOne({ whatsappNumber });
}

async function createMerchant(whatsappNumber, keyId, keySecretPlain) {
  const razorpayKeySecretEncrypted = encrypt(keySecretPlain);
  return Merchant.create({
    whatsappNumber,
    razorpayKeyId: keyId,
    razorpayKeySecretEncrypted,
  });
}

async function deleteMerchant(whatsappNumber) {
  return Merchant.deleteOne({ whatsappNumber });
}

module.exports = {
  isValidKeyId,
  isValidKeySecret,
  maskKeyId,
  findMerchant,
  createMerchant,
  deleteMerchant,
};