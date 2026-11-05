const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errors');

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://online-leave-management-system-for-phi.vercel.app',
];

/** CLIENT_URL may hold one origin or a comma-separated list. */
function allowedOrigins() {
  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return configured.length ? configured : DEFAULT_ORIGINS;
}

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: allowedOrigins(),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/leaves', require('./routes/leaves'));
  app.use('/api/holidays', require('./routes/holidays'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/admin', require('./routes/admin'));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp, allowedOrigins };
