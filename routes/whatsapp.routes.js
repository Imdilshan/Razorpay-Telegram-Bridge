const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../features/whatsapp-bot/whatsapp.controller');

router.post('/incoming', handleIncomingMessage);

module.exports = router;