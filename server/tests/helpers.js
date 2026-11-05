// Integration-test harness: runs the real Express app against a throwaway
// MongoDB. Set TEST_MONGODB_URI to use an existing server, otherwise a
// temporary `mongod` (from PATH or MONGOD_PATH) is started and removed.
const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.NODE_ENV = 'test';
delete process.env.GMAIL_USER;
delete process.env.GMAIL_PASS;

const { createApp } = require('../app');

const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });

async function startMongo() {
  if (process.env.TEST_MONGODB_URI) return { uri: process.env.TEST_MONGODB_URI, stop: async () => {} };

  const dbPath = fs.mkdtempSync(path.join(os.tmpdir(), 'olms-test-'));
  const port = await freePort();
  const child = spawn(process.env.MONGOD_PATH || 'mongod', ['--dbpath', dbPath, '--port', String(port), '--bind_ip', '127.0.0.1'], {
    stdio: 'ignore',
  });
  const spawnError = new Promise((_, reject) => child.on('error', reject));
  const uri = `mongodb://127.0.0.1:${port}/olms-test`;

  // Wait for mongod to accept connections.
  const deadline = Date.now() + 30000;
  for (;;) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await Promise.race([mongoose.connect(uri, { serverSelectionTimeoutMS: 1000 }), spawnError]);
      await mongoose.disconnect();
      break;
    } catch (err) {
      if (err.code === 'ENOENT') throw new Error('mongod not found. Install MongoDB or set TEST_MONGODB_URI / MONGOD_PATH.');
      if (Date.now() > deadline) throw err;
    }
  }

  return {
    uri,
    stop: async () => {
      child.kill();
      await new Promise((resolve) => child.once('exit', resolve));
      fs.rmSync(dbPath, { recursive: true, force: true });
    },
  };
}

async function startTestServer() {
  const mongo = await startMongo();
  await mongoose.connect(mongo.uri);
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));

  const app = createApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

  async function request(method, url, { body, token } = {}) {
    const res = await fetch(baseUrl + url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  }

  return {
    request,
    async stop() {
      await new Promise((resolve) => server.close(resolve));
      await mongoose.disconnect();
      await mongo.stop();
    },
  };
}

/** YYYY-MM-DD for today + offset days (UTC). */
function isoDay(offsetDays = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

module.exports = { startTestServer, isoDay };
