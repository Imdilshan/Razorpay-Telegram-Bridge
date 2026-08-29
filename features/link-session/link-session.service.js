const LinkSession = require('./link-session.model');

async function getSession(whatsappNumber) {
  return LinkSession.findOne({ whatsappNumber });
}

async function createSession(whatsappNumber, step) {
  await LinkSession.deleteOne({ whatsappNumber });
  return LinkSession.create({ whatsappNumber, step, retryCount: 0 });
}

async function updateSession(whatsappNumber, updates) {
  return LinkSession.findOneAndUpdate({ whatsappNumber }, updates, { new: true });
}

async function deleteSession(whatsappNumber) {
  return LinkSession.deleteOne({ whatsappNumber });
}

async function incrementRetry(whatsappNumber) {
  return LinkSession.findOneAndUpdate(
    { whatsappNumber },
    { $inc: { retryCount: 1 } },
    { new: true }
  );
}

module.exports = {
  getSession,
  createSession,
  updateSession,
  deleteSession,
  incrementRetry,
};