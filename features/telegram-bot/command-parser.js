// const COMMANDS = {
//   SUCCESS_RATE: 'SUCCESS_RATE',
//   SETTLEMENT: 'SETTLEMENT',
//   DISCONNECT: 'DISCONNECT',
//   HELP: 'HELP',
// };

// function parseCommand(rawBody) {
//   const text = (rawBody || '').trim().toLowerCase();

//   if (text === 'success rate' || text === 'success') {
//     return { type: COMMANDS.SUCCESS_RATE };
//   }

//   if (
//     text === 'settlement' ||
//     text === 'settlement status'
//   ) {
//     return { type: COMMANDS.SETTLEMENT };
//   }

//   if (text === 'disconnect' || text === 'logout') {
//     return { type: COMMANDS.DISCONNECT };
//   }

//   return { type: COMMANDS.HELP };
// }

// module.exports = {
//   parseCommand,
//   COMMANDS,
// };

const COMMANDS = {
  TODAY: 'TODAY',
  RECENT_PAYMENTS: 'RECENT_PAYMENTS',
  WEEKLY: 'WEEKLY',
  SUCCESS_RATE: 'SUCCESS_RATE',
  SETTLEMENT: 'SETTLEMENT',
  DISCONNECT: 'DISCONNECT',
  HELP: 'HELP',
};

function parseCommand(rawBody) {
  const text = (rawBody || '').trim().toLowerCase();

  if (text === 'today' || text === "today's collections" || text === 'todays collections') {
    return { type: COMMANDS.TODAY };
  }

  if (text === 'recent payments' || text === 'recent transactions' || text === 'recent') {
    return { type: COMMANDS.RECENT_PAYMENTS };
  }

  if (text === 'this week' || text === 'weekly performance' || text === 'week') {
    return { type: COMMANDS.WEEKLY };
  }

  if (text === 'success rate' || text === 'success') {
    return { type: COMMANDS.SUCCESS_RATE };
  }

  if (
    text === 'settlement' ||
    text === 'settlement status'
  ) {
    return { type: COMMANDS.SETTLEMENT };
  }

  if (text === 'disconnect' || text === 'logout') {
    return { type: COMMANDS.DISCONNECT };
  }

  return { type: COMMANDS.HELP };
}

module.exports = {
  parseCommand,
  COMMANDS,
};