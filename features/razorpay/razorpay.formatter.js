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
  return `💰 Last settlement\n${formatAmount(settlement.amount)} on ${date} (${settlement.status})`;
}

const HELP_TEXT = `Here's what you can ask me:
- "success rate" — your recent payment success rate
- "settlement status" — your last settlement
- "disconnect" — unlink your Razorpay account
- "help" (shows this message)`;

module.exports = { formatSuccessRate, formatLastSettlement, HELP_TEXT, formatAmount };
