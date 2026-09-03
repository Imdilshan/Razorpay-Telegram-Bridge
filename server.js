require('dotenv').config();
const express = require('express');
const { connectDB } = require('./lib/db');
const telegramRoutes = require('./routes/telegram.routes');

const app = express();
app.use(express.json()); // Telegram sends JSON payloads

app.get('/health', (req, res) => res.status(200).send('ok'));
app.use('/webhook/telegram', telegramRoutes);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });