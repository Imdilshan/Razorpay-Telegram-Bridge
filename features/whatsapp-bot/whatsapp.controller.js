const linkingController = require('./linking.controller');
const queryController = require('./query.controller');
const { sendWhatsAppMessage } = require('../../lib/twilio');

async function handleIncomingMessage(req, res) {
  const from = req.body.From; // e.g. 'whatsapp:+91XXXXXXXXXX'
  const body = req.body.Body || '';

  let reply;

  try {
    reply = await linkingController.handleLinkingFlow(from, body);

    if (reply === null) {
      reply = await queryController.handleQueryCommand(from, body);
    }
  } catch (err) {
    console.error('Error handling incoming WhatsApp message:', err);
    reply = `Something went wrong on our end. Please try again in a moment.`;
  }

  try {
    await sendWhatsAppMessage(from, reply);
  } catch (err) {
    console.error('Error sending WhatsApp reply:', err);
  }

  res.status(200).send('<Response></Response>');
}

module.exports = { handleIncomingMessage };