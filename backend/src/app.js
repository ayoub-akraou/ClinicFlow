require('dotenv').config();

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ data: { status: 'ok' } });
});

app.use('/api', apiRoutes);
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route introuvable.' } });
});
app.use(errorHandler);

module.exports = app;
