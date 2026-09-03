const COMMANDS = {
  TODAY_COLLECTIONS: 'TODAY_COLLECTIONS',
  RECENT_TRANSACTIONS: 'RECENT_TRANSACTIONS',
  WEEKLY_PERFORMANCE: 'WEEKLY_PERFORMANCE',
  SETTLEMENT: 'SETTLEMENT',
  DISCONNECT: 'DISCONNECT',
  HELP: 'HELP',
};

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[?!.,]/g, '')
    .replace(/\s+/g, ' ');
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function parseCommand(rawBody) {
  const text = normalize(rawBody);

  // -----------------------------
  // Disconnect
  // -----------------------------
  if (
    hasAny(text, [
      'disconnect',
      'logout',
      'unlink',
      'account hatao',
      'account remove',
    ])
  ) {
    return { type: COMMANDS.DISCONNECT };
  }

  // -----------------------------
  // Settlement
  // -----------------------------
  if (
    hasAny(text, [
      'settlement',
      'settle',
      'settlement status',
      'last settlement',
      'settlement kab',
      'paisa kab settle',
      'settlement dikhao',
      'settlement batao',
    ])
  ) {
    return { type: COMMANDS.SETTLEMENT };
  }

  // -----------------------------
  // Recent Transactions
  // -----------------------------
  if (
    hasAny(text, [
      'recent payment',
      'recent payments',
      'recent transaction',
      'recent transactions',
      'last payment',
      'last payments',
      'last transaction',
      'last transactions',
      'latest payment',
      'latest payments',
      'latest transaction',
      'latest transactions',
      'recent payment dikhao',
      'recent payments dikhao',
    ])
  ) {
    return { type: COMMANDS.RECENT_TRANSACTIONS };
  }

  // -----------------------------
  // Weekly Performance
  // -----------------------------
  if (
    hasAny(text, [
      'this week',
      'this weeks',
      'weekly',
      'weekly collection',
      'week ka collection',
      'week ki collection',
      'is hafte',
      'iss hafte',
      'is week',
      'iss week',
      'hafte ka collection',
      'hafte ki collection',
    ])
  ) {
    return { type: COMMANDS.WEEKLY_PERFORMANCE };
  }

  // -----------------------------
  // Today's Collections
  // -----------------------------
  if (
    hasAny(text, [
      'today',
      'todays',
      'aaj',
      'aaj ka',
      'aaj ki',
      'aaj kitna',
      'today collection',
      'today payment',
      'today payments',
      'today collection',
      'how much did i collect today',
      'how much money came in today',
    ])
  ) {
    return { type: COMMANDS.TODAY_COLLECTIONS };
  }

  // -----------------------------
  // Help
  // -----------------------------
  if (
    hasAny(text, [
      'help',
      'what can you do',
      'what do you do',
      'kya kar sakte ho',
      'kya kya kar sakte ho',
      'commands',
    ])
  ) {
    return { type: COMMANDS.HELP };
  }

  return { type: COMMANDS.HELP };
}

module.exports = {
  parseCommand,
  COMMANDS,
};