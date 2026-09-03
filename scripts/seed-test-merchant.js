// One-off helper: seeds a single merchant record straight into MongoDB, encrypted,
// bypassing the Telegram onboarding flow — for local testing only.
// Fill in RAZORPAY_TEST_KEY_ID / RAZORPAY_TEST_KEY_SECRET / RAZORPAY_TEST_TELEGRAM_CHAT_ID
// in .env, then run: node scripts/seed-test-merchant.js
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../lib/db');
const Merchant = require('../features/merchant/merchant.model');
const { encrypt } = require('../lib/encryption');

async function main() {
  const keyId = process.env.RAZORPAY_TEST_KEY_ID;
  const keySecret = process.env.RAZORPAY_TEST_KEY_SECRET;
  const telegramChatId = process.env.RAZORPAY_TEST_TELEGRAM_CHAT_ID;

  if (!keyId || !keySecret || !telegramChatId) {
    console.error('Set RAZORPAY_TEST_KEY_ID, RAZORPAY_TEST_KEY_SECRET, and RAZORPAY_TEST_TELEGRAM_CHAT_ID in .env first.');
    process.exit(1);
  }

  await connectDB();

  await Merchant.findOneAndUpdate(
    { telegramChatId },
    {
      $set: {
        keyId,
        keySecretEncrypted: encrypt(keySecret),
        onboardingState: null,
        pendingKeyId: null,
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  console.log(`Seeded merchant ${telegramChatId} with key ${keyId}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});