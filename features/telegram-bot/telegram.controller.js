const onboardingController = require('./onboarding.controller');
const queryController = require('./query.controller');
const merchantService = require('../merchant/merchant.service');
const {
  sendTelegramMessage,
  answerCallbackQuery,
  buildMainMenuKeyboard,
} = require('../../lib/telegram');

const WELCOME_TEXT = `👋 Welcome to Razorpay Merchant Copilot\n\nWhat would you like to know?`;

function isMenuCommand(body) {
  const text = (body || '').trim().toLowerCase();
  return text === '/start' || text === 'start' || text === 'menu';
}

async function handleIncomingMessage(req, res) {
  const callbackQuery = req.body.callback_query;
  if (callbackQuery) {
    await handleCallbackQuery(callbackQuery);
    return res.status(200).send('ok');
  }

  const message = req.body.message;

  if (!message || !message.chat) {
    return res.status(200).send('ok');
  }

  const chatId = message.chat.id;
  const body = message.text || '';

  let reply;
  let replyMarkup;
  try {
    const merchant = await merchantService.findMerchant(chatId);

    if (!merchantService.isConnected(merchant)) {
      reply = await onboardingController.handleOnboarding(chatId, body, merchant);
    } else if (isMenuCommand(body)) {
      reply = WELCOME_TEXT;
      replyMarkup = buildMainMenuKeyboard();
    } else {
      reply = await queryController.handleQueryCommand(chatId, merchant, body);
    }
  } catch (err) {
    console.error('Error handling incoming Telegram message:', err);
    reply = `Something went wrong on our end. Please try again in a moment.`;
  }

  try {
    await sendTelegramMessage(chatId, reply, { replyMarkup });
  } catch (err) {
    console.error('Error sending Telegram message:', err.message);
  }

  res.status(200).send('ok');
}

// Button taps arrive as callback_query updates, not message updates — Telegram
// requires these to be acknowledged separately (see answerCallbackQuery), and
// there is no req.body.message here, so this needed its own branch above.
async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message && callbackQuery.message.chat && callbackQuery.message.chat.id;
  const data = callbackQuery.data || '';

  try {
    await answerCallbackQuery(callbackQuery.id);
  } catch (err) {
    console.error('Error answering Telegram callback query:', err.message);
  }

  if (!chatId) return;

  let reply;
  try {
    const merchant = await merchantService.findMerchant(chatId);

    if (!merchantService.isConnected(merchant)) {
      reply = `Type 'connect' to link your Razorpay account first.`;
    } else {
      reply = await queryController.handleQueryCommand(chatId, merchant, data);
    }
  } catch (err) {
    console.error('Error handling Telegram callback query:', err);
    reply = `Something went wrong on our end. Please try again in a moment.`;
  }

  try {
    await sendTelegramMessage(chatId, reply);
  } catch (err) {
    console.error('Error sending Telegram message:', err.message);
  }
}

module.exports = { handleIncomingMessage };