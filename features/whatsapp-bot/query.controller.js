const merchantService = require('../merchant/merchant.service');
const { parseCommand, COMMANDS } = require('./command-parser');
const razorpayClient = require('../razorpay/razorpay.client');
const formatter = require('../razorpay/razorpay.formatter');
const cache = require('./cache');
const dateRange = require('../../lib/date-range');

function resolveTimestampRange(range) {
  if (range === 'today') {
    return { from: dateRange.startOfTodayUnix(), to: dateRange.nowUnix() };
  }
  if (range === '7d') {
    return { from: dateRange.daysAgoUnix(7), to: dateRange.nowUnix() };
  }
  return {};
}

async function handleQueryCommand(whatsappNumber, rawBody) {
  const merchant = await merchantService.findMerchant(whatsappNumber);

  if (!merchant) {
    return `You haven't linked a Razorpay account yet. Type 'link' to get started.`;
  }

  const command = parseCommand(rawBody);

  if (command.type === COMMANDS.HELP) {
    return formatter.HELP_TEXT;
  }

  if (command.type === COMMANDS.UNKNOWN) {
    return `Sorry, I didn't understand that. Type 'help' to see what I can do.`;
  }

  const merchantId = merchant._id.toString();

  try {
    if (command.type === COMMANDS.GET_PAYMENTS) {
      const cacheKey = `payments:${command.status || 'all'}:${command.range}`;
      const cached = cache.get(merchantId, cacheKey);
      if (cached) {
        return formatter.formatPaymentsSummary(cached, { failedOnly: command.status === 'failed' });
      }

      const { from, to } = resolveTimestampRange(command.range);
      let payments = await razorpayClient.fetchPayments(merchant, { from, to });

      if (command.status === 'failed') {
        payments = payments.filter((p) => p.status === 'failed');
      }

      cache.set(merchantId, cacheKey, payments);
      return formatter.formatPaymentsSummary(payments, { failedOnly: command.status === 'failed' });
    }

    if (command.type === COMMANDS.GET_SETTLEMENTS) {
      const cacheKey = `settlements:${command.range}`;
      const cached = cache.get(merchantId, cacheKey);
      if (cached) {
        return formatter.formatSettlementsSummary(cached);
      }

      const { from, to } = resolveTimestampRange(command.range);
      const settlements = await razorpayClient.fetchSettlements(merchant, { from, to });

      cache.set(merchantId, cacheKey, settlements);
      return formatter.formatSettlementsSummary(settlements);
    }
  } catch (err) {
    console.error('Razorpay API error:', err.message);
    return `Couldn't fetch your data right now, please try again in a moment.`;
  }

  return `Sorry, I didn't understand that. Type 'help' to see what I can do.`;
}

module.exports = { handleQueryCommand };