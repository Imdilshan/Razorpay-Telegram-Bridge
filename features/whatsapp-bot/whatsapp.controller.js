const { MessagingResponse } = require('twilio').twiml;
const onboardingController = require('./onboarding.controller');
const queryController = require('./query.controller');
const merchantService = require('../merchant/merchant.service');

async function handleIncomingMessage(req, res) {
  const from = req.body.From;
  const body = req.body.Body || '';

  let reply;
  try {
    const merchant = await merchantService.findMerchant(from);

    if (!merchantService.isConnected(merchant)) {
      reply = await onboardingController.handleOnboarding(from, body, merchant);
    } else {
      reply = await queryController.handleQueryCommand(from, merchant, body);
    }
  } catch (err) {
    console.error('Error handling incoming WhatsApp message:', err);
    reply = `Something went wrong on our end. Please try again in a moment.`;
  }

  const twiml = new MessagingResponse();
  twiml.message(reply);

  res.set('Content-Type', 'text/xml');
  res.status(200).send(twiml.toString());
}

module.exports = { handleIncomingMessage };
