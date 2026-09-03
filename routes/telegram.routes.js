const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../features/telegram-bot/telegram.controller');

router.post('/incoming', handleIncomingMessage);

module.exports = router;