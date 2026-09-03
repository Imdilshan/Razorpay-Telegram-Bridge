// function formatAmount(paise) {
//   return `₹${(paise / 100).toLocaleString('en-IN')}`;
// }

// function formatSuccessRate({ total, captured, failed, rate }) {
//   if (total === 0) {
//     return 'No payments found in the last 7 days.';
//   }
//   return `📊 Success rate (last 7 days)\n${rate.toFixed(1)}% (${captured}/${total} captured, ${failed} failed)`;
// }

// function formatLastSettlement(settlement) {
//   if (!settlement) {
//     return 'No settlements found yet.';
//   }
//   const date = new Date(settlement.created_at * 1000).toLocaleDateString('en-IN');
//   return `💰 Last settlement\n${formatAmount(settlement.amount)} on ${date} (${settlement.status})`;
// }

// const HELP_TEXT = `Here's what you can ask me:
// - "success rate" — your recent payment success rate
// - "settlement status" — your last settlement
// - "disconnect" — unlink your Razorpay account
// - "help" (shows this message)`;

// module.exports = { formatSuccessRate, formatLastSettlement, HELP_TEXT, formatAmount };


function formatAmount(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

function formatSuccessRate({ total, captured, failed, rate }) {
  if (total === 0) {
    return 'No payments found in the last 7 days.';
  }
  return `📊 Success rate (last 7 days)\n${rate.toFixed(1)}% (${captured}/${total} captured, ${failed} failed)`;
}

function formatLastSettlement(settlement) {
  if (!settlement) {
    return 'No settlements found yet.';
  }
  const date = new Date(settlement.created_at * 1000).toLocaleDateString('en-IN');
  return `💰 Settlement Status\n\nLatest settlement\n\n${formatAmount(settlement.amount)}\n✅ ${settlement.status}\n📅 ${date}`;
}

function formatCollectionStats({ total, captured, failed, rate, amountCollected }, { title, emptyLabel }) {
  if (total === 0) {
    return `${title}\n\nNo payments found${emptyLabel ? ` ${emptyLabel}` : ''}.`;
  }
  return [
    title,
    '',
    `💰 ${formatAmount(amountCollected)} collected`,
    `🧾 ${total} payments`,
    `✅ ${captured} successful`,
    `❌ ${failed} failed`,
    `📈 ${rate.toFixed(1)}% success rate`,
  ].join('\n');
}

function formatTodayCollections(stats) {
  return formatCollectionStats(stats, { title: "📊 Today's Collections", emptyLabel: 'today' });
}

function formatWeeklyPerformance(stats) {
  return formatCollectionStats(stats, { title: '📈 Weekly Performance', emptyLabel: 'this week' });
}

function formatRecentPayments(payments) {
  if (payments.length === 0) {
    return '💳 Recent Transactions\n\nNo payments found yet.';
  }
  const statusLine = (status) => {
    if (status === 'captured') return '✅ Captured';
    if (status === 'failed') return '❌ Failed';
    return `⏳ ${status}`;
  };
  const lines = payments.map((p) => `${formatAmount(p.amount)}  ${statusLine(p.status)}`);
  return `💳 Recent Transactions\n\n${lines.join('\n')}\n\nShowing your latest transactions.`;
}

const HELP_TEXT = `Here's what you can ask me:
- "today" — today's collections
- "recent payments" — your latest transactions
- "this week" — weekly performance
- "settlement" — your last settlement status
- "disconnect" — unlink your Razorpay account
- "/start" — show the menu buttons
- "help" (shows this message)`;

module.exports = {
  formatSuccessRate,
  formatLastSettlement,
  formatTodayCollections,
  formatWeeklyPerformance,
  formatRecentPayments,
  HELP_TEXT,
  formatAmount,
};
