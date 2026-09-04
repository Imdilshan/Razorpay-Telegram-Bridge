const axios = require('axios');

const TELEGRAM_API_BASE = 'https://api.telegram.org';

function getBotUrl(method) {
  return `${TELEGRAM_API_BASE}/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;
}

async function sendTelegramMessage(chatId, text, { replyMarkup } = {}) {
  const payload = { chat_id: chatId, text };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }
  return axios.post(getBotUrl('sendMessage'), payload);
}

async function answerCallbackQuery(callbackQueryId, text) {
  const payload = { callback_query_id: callbackQueryId };
  if (text) payload.text = text;
  return axios.post(getBotUrl('answerCallbackQuery'), payload);
}

function buildMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "📊 Today's Collections", callback_data: 'today' }],
      [{ text: '💳 Recent Transactions', callback_data: 'recent payments' }],
      [{ text: '📈 Weekly Performance', callback_data: 'this week' }],
      [{ text: '💰 Settlement Status', callback_data: 'settlement' }],
    ],
  };
}

module.exports = { sendTelegramMessage, answerCallbackQuery, buildMainMenuKeyboard };