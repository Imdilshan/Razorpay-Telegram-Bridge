const merchantService = require('../merchant/merchant.service');

const START_WORDS = ['connect', 'start'];

/**
 * Drives the onboardingState state machine for a merchant that isn't
 * connected yet: awaiting_key_id -> awaiting_key_secret -> connected.
 */
async function handleOnboarding(whatsappNumber, rawBody, merchant) {
  const body = rawBody || '';
  // trimmed/lower are only used for command routing and format validation below —
  // the credential values persisted to Mongo must stay exactly as the merchant sent them.
  const trimmed = body.trim();
  const lower = trimmed.toLowerCase();

  if (!merchant) {
    await merchantService.startOnboarding(whatsappNumber);
    return `Let's connect your Razorpay account. Send your Key ID (starts with rzp_test_)`;
  }

  if (!merchant.onboardingState) {
    if (START_WORDS.includes(lower)) {
      await merchantService.startOnboarding(whatsappNumber);
      return `Let's connect your Razorpay account. Send your Key ID (starts with rzp_test_)`;
    }
    return `Type 'connect' or 'start' to link your Razorpay account.`;
  }

  if (merchant.onboardingState === 'awaiting_key_id') {
    if (!merchantService.isValidKeyId(trimmed)) {
      return `That doesn't look like a valid Key ID. Please send your Key ID (starts with rzp_test_).`;
    }
    await merchantService.setPendingKeyId(whatsappNumber, body);
    return `Got it. Now send your Key Secret.`;
  }

  if (merchant.onboardingState === 'awaiting_key_secret') {
    if (!merchantService.isValidKeySecret(trimmed)) {
      return `That doesn't look like a valid Key Secret. Please send your Key Secret.`;
    }
    await merchantService.completeOnboarding(whatsappNumber, body);
    return `✅ Connected! You can now ask me things like:\n'success rate', 'settlement status'`;
  }

  await merchantService.resetOnboarding(whatsappNumber);
  return `Something went wrong, let's start over. Type 'connect' to link your Razorpay account.`;
}

module.exports = { handleOnboarding };
