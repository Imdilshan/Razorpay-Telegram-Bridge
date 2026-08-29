function formatAmount(paise) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

function formatPaymentsSummary(payments, { failedOnly = false } = {}) {
  if (payments.length === 0) {
    return failedOnly
      ? 'No failed payments found for this period. ✅'
      : 'No payments found for this period.';
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const captured = payments.filter((p) => p.status === 'captured');
  const failed = payments.filter((p) => p.status === 'failed');

  let text = `📊 Payments\nTotal: ${formatAmount(totalAmount)} across ${payments.length} payment(s)\n`;
  text += `✅ ${captured.length} captured\n`;
  if (failed.length > 0) {
    const firstFailed = failed[0];
    const reason = firstFailed.error_description || 'reason unavailable';
    text += `❌ ${failed.length} failed (${formatAmount(firstFailed.amount)}, ${reason})`;
  }
  return text.trim();
}

function formatSettlementsSummary(settlements) {
  if (settlements.length === 0) {
    return 'No settlements found for this period.';
  }

  const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0);
  let text = `💰 Settlements\nTotal: ${formatAmount(totalAmount)} across ${settlements.length} settlement(s)\n`;

  settlements.slice(0, 3).forEach((s) => {
    const date = new Date(s.created_at * 1000).toLocaleDateString('en-IN');
    text += `- ${formatAmount(s.amount)} on ${date} (${s.status})\n`;
  });

  return text.trim();
}

const HELP_TEXT = `Here's what you can ask me:
- "today's payments"
- "payments this week"
- "failed payments"
- "settlement status"
- "help" (shows this message)`;

module.exports = { formatPaymentsSummary, formatSettlementsSummary, HELP_TEXT, formatAmount };