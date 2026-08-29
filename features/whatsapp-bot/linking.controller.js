const linkSessionService = require('../link-session/link-session.service');
const merchantService = require('../merchant/merchant.service');
const cache = require('./cache');

const TRIGGER_WORD = 'link';

/**
 * Handles a single incoming message as part of the linking flow.
 * Returns a reply string if this message was handled by the linking flow,
 * or null if it's not part of linking (caller should route it elsewhere,
 * e.g. to query command handling).
 */
async function handleLinkingFlow(whatsappNumber, rawBody) {
  const body = (rawBody || '').trim();
  const bodyLower = body.toLowerCase();

  const session = await linkSessionService.getSession(whatsappNumber);

  if (!session) {
    if (bodyLower !== TRIGGER_WORD) return null; // not a linking message, let caller decide

    const existingMerchant = await merchantService.findMerchant(whatsappNumber);

    if (existingMerchant) {
      await linkSessionService.createSession(whatsappNumber, 'confirm_relink_intent');
      const masked = merchantService.maskKeyId(existingMerchant.razorpayKeyId);
      return `You already have an account linked (Key ID: ${masked}). Do you want to unlink it and add a new one? Reply 'yes' or 'no'.`;
    }

    await linkSessionService.createSession(whatsappNumber, 'awaiting_key_id');
    return `Let's link your Razorpay account. Send your Key ID (starts with rzp_test_)`;
  }

  switch (session.step) {
    case 'confirm_relink_intent':
      return handleConfirmRelinkIntent(whatsappNumber, bodyLower);
    case 'confirm_relink_final':
      return handleConfirmRelinkFinal(whatsappNumber, bodyLower);
    case 'awaiting_key_id':
      return handleAwaitingKeyId(whatsappNumber, body, bodyLower);
    case 'awaiting_secret':
      return handleAwaitingSecret(whatsappNumber, body, bodyLower, session);
    default:
      // stray/unrecognized state — clean up rather than get stuck
      await linkSessionService.deleteSession(whatsappNumber);
      return null;
  }
}

async function retryOrOfferCancel(whatsappNumber, initialPrompt) {
  const session = await linkSessionService.incrementRetry(whatsappNumber);
  if (session.retryCount === 1) {
    return `That doesn't look right. ${initialPrompt}`;
  }
  if (session.retryCount === 2) {
    return `Still not quite right. Try again, or type 'cancel' to stop.`;
  }
  return `Having trouble? Type 'cancel' to stop, or try one more time.`;
}

async function handleConfirmRelinkIntent(whatsappNumber, bodyLower) {
  if (bodyLower === 'cancel' || bodyLower === 'no') {
    await linkSessionService.deleteSession(whatsappNumber);
    return `No changes made. Your current account is still linked.`;
  }
  if (bodyLower === 'yes') {
    await linkSessionService.updateSession(whatsappNumber, {
      step: 'confirm_relink_final',
      retryCount: 0,
    });
    return `⚠️ This will remove your current linked account. Confirm by typing 'confirm'.`;
  }
  return retryOrOfferCancel(whatsappNumber, `Reply 'yes' or 'no'.`);
}

async function handleConfirmRelinkFinal(whatsappNumber, bodyLower) {
  if (bodyLower === 'cancel' || bodyLower === 'no') {
    await linkSessionService.deleteSession(whatsappNumber);
    return `No changes made. Your current account is still linked.`;
  }
  if (bodyLower === 'confirm') {
    const oldMerchant = await merchantService.findMerchant(whatsappNumber);
    if (oldMerchant) cache.clearForMerchant(oldMerchant._id.toString());
    await merchantService.deleteMerchant(whatsappNumber);
    await linkSessionService.updateSession(whatsappNumber, {
      step: 'awaiting_key_id',
      keyId: null,
      retryCount: 0,
    });
    return `Old account unlinked. Let's link your new Razorpay account. Send your Key ID (starts with rzp_test_)`;
  }
  return retryOrOfferCancel(whatsappNumber, `Type 'confirm' to proceed, or 'no' to cancel.`);
}

async function handleAwaitingKeyId(whatsappNumber, body, bodyLower) {
  if (bodyLower === 'cancel') {
    await linkSessionService.deleteSession(whatsappNumber);
    return `Linking cancelled.`;
  }
  if (!merchantService.isValidKeyId(body)) {
    return retryOrOfferCancel(whatsappNumber, `Please send just your Key ID (starts with rzp_test_).`);
  }
  await linkSessionService.updateSession(whatsappNumber, {
    step: 'awaiting_secret',
    keyId: body,
    retryCount: 0,
  });
  return `Got it. Now send your Key Secret.`;
}

async function handleAwaitingSecret(whatsappNumber, body, bodyLower, session) {
  if (bodyLower === 'cancel') {
    await linkSessionService.deleteSession(whatsappNumber);
    return `Linking cancelled.`;
  }
  if (!merchantService.isValidKeySecret(body)) {
    return retryOrOfferCancel(whatsappNumber, `Please send your Key Secret.`);
  }
  await merchantService.createMerchant(whatsappNumber, session.keyId, body);
  await linkSessionService.deleteSession(whatsappNumber);
  return `✅ Linked! You can now ask me things like:\n'today's payments', 'settlement status', 'failed payments this week'`;
}

module.exports = { handleLinkingFlow };