require('dotenv').config();
const express = require('express');
const { connectDB } = require('./lib/db');
const whatsappRoutes = require('./routes/whatsapp.routes');

const app = express();
app.use(express.urlencoded({ extended: false })); // Twilio sends form-encoded payloads
app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('ok'));
app.use('/webhook/whatsapp', whatsappRoutes);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });