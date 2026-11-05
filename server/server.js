const path = require('path');
const fs = require('fs');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// server/.env takes precedence over a project-root .env.
[path.join(__dirname, '.env'), path.join(__dirname, '..', '.env')]
  .filter((file) => fs.existsSync(file))
  .forEach((file) => dotenv.config({ path: file, override: false }));

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Add it to server/.env before starting the server.');
}

const User = require('./models/User');
const { DEFAULT_LEAVE_BALANCE } = require('./constants');
const { createApp, allowedOrigins } = require('./app');
const { attachSocket } = require('./socket');

const app = createApp();

/** Accounts created before leave balances existed get the default entitlement. */
async function backfillLeaveBalances() {
  await Promise.all(
    Object.entries(DEFAULT_LEAVE_BALANCE).map(([type, days]) =>
      User.updateMany({ [`leaveBalance.${type}`]: { $exists: false } }, { $set: { [`leaveBalance.${type}`]: days } })
    )
  );
}

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leave-management')
  .then(() => {
    console.log('[db] connected');
    return backfillLeaveBalances();
  })
  .catch((err) => console.error('[db] connection error:', err.message));

// Serverless platforms (Vercel) import the app and handle HTTP themselves;
// realtime notifications are only available when running a long-lived server.
if (process.env.NODE_ENV !== 'production') {
  const server = http.createServer(app);
  app.set('io', attachSocket(server, allowedOrigins()));
  const port = process.env.PORT || 5000;
  server.listen(port, () => console.log(`[http] listening on port ${port}`));
}

module.exports = app;
