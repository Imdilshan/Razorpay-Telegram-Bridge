const COMMANDS = {
  HELP: 'HELP',
  GET_PAYMENTS: 'GET_PAYMENTS',
  GET_SETTLEMENTS: 'GET_SETTLEMENTS',
  UNKNOWN: 'UNKNOWN',
};

function parseCommand(rawBody) {
  const text = (rawBody || '').trim().toLowerCase();

  if (text === 'help') {
    return { type: COMMANDS.HELP };
  }

  const mentionsFailed = text.includes('failed');
  const mentionsWeek = text.includes('week');
  const mentionsSettlement = text.includes('settlement');
  const mentionsPayment = text.includes('payment');

  if (mentionsSettlement) {
    return { type: COMMANDS.GET_SETTLEMENTS, range: '7d' };
  }

  if (mentionsFailed) {
    return {
      type: COMMANDS.GET_PAYMENTS,
      status: 'failed',
      range: mentionsWeek ? '7d' : 'today',
    };
  }

  if (mentionsPayment) {
    return {
      type: COMMANDS.GET_PAYMENTS,
      range: mentionsWeek ? '7d' : 'today',
    };
  }

  return { type: COMMANDS.UNKNOWN };
}

module.exports = { COMMANDS, parseCommand };