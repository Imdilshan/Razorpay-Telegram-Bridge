// const axios = require('axios');

// const TELEGRAM_API_BASE = 'https://api.telegram.org';

// function getBotUrl(method) {
//   return `${TELEGRAM_API_BASE}/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;
// }

// async function sendTelegramMessage(chatId, text) {
//   return axios.post(getBotUrl('sendMessage'), {
//     chat_id: chatId,
//     text,
//   });
// }

// module.exports = { sendTelegramMessage };


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

// Telegram requires every button tap (callback_query) to be acknowledged,
// otherwise the client shows a loading spinner on the button until it times out.
async function answerCallbackQuery(callbackQueryId, text) {
  const payload = { callback_query_id: callbackQueryId };
  if (text) payload.text = text;
  return axios.post(getBotUrl('answerCallbackQuery'), payload);
}

// callback_data values reuse the same plain-text commands the parser already
// understands ('today', 'recent payments', 'this week', 'settlement'), so a
// button tap can be routed through the exact same command handling as typed text.
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