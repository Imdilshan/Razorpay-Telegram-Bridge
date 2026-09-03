const merchantService = require('../merchant/merchant.service');
const { parseCommand, COMMANDS } = require('./command-parser');
const razorpayClient = require('../razorpay/razorpay.client');
const formatter = require('../razorpay/razorpay.formatter');
const cache = require('./cache');
const dateRange = require('../../lib/date-range');

async function handleQueryCommand(chatId, merchant, rawBody) {
  const command = parseCommand(rawBody);
  const merchantId = merchant._id.toString();

  try {
    if (command.type === COMMANDS.DISCONNECT) {
      await merchantService.disconnectMerchant(chatId);
      cache.clearForMerchant(merchantId);
      return `You've been disconnected. Your Razorpay credentials have been removed. Type 'connect' to link again.`;
    }

    if (command.type === COMMANDS.TODAY_COLLECTIONS) {
      const cacheKey = 'today-collections';
      let stats = cache.get(merchantId, cacheKey);
      if (!stats) {
        const from = dateRange.startOfTodayUnix();
        const to = dateRange.nowUnix();
        stats = await razorpayClient.getCollectionStats(merchant, { from, to });
        cache.set(merchantId, cacheKey, stats);
      }
      return formatter.formatTodayCollections(stats);
    }

    if (command.type === COMMANDS.WEEKLY_PERFORMANCE) {
      const cacheKey = 'weekly-performance';
      let stats = cache.get(merchantId, cacheKey);
      if (!stats) {
        const from = dateRange.daysAgoUnix(7);
        const to = dateRange.nowUnix();
        stats = await razorpayClient.getCollectionStats(merchant, { from, to });
        cache.set(merchantId, cacheKey, stats);
      }
      return formatter.formatWeeklyPerformance(stats);
    }

    if (command.type === COMMANDS.RECENT_TRANSACTIONS) {
      const cacheKey = 'recent-payments';
      let payments = cache.get(merchantId, cacheKey);
      if (!payments) {
        payments = await razorpayClient.getRecentPayments(merchant, { count: 5 });
        cache.set(merchantId, cacheKey, payments);
      }
      return formatter.formatRecentPayments(payments);
    }

    if (command.type === COMMANDS.SETTLEMENT) {
      const cacheKey = 'last-settlement';
      let settlement = cache.get(merchantId, cacheKey);
      if (!settlement) {
        settlement = await razorpayClient.getLastSettlement(merchant);
        cache.set(merchantId, cacheKey, settlement);
      }
      return formatter.formatLastSettlement(settlement);
    }
  } catch (err) {
    console.error('Razorpay API error:', err.message);
    return `Couldn't fetch your data right now, please try again in a moment.`;
  }

  return formatter.HELP_TEXT;
}

module.exports = { handleQueryCommand };