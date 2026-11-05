// Creates (or repairs) the initial administrator account.
// Usage: ADMIN_EMAIL=you@company.com ADMIN_PASSWORD=... node scripts/createAdmin.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'admin123';

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    console.log(`Admin account ${email} already existed; role and status confirmed.`);
  } else {
    await User.create({
      name: 'Administrator',
      email,
      password,
      role: 'admin',
      department: 'Administration',
      position: 'System Administrator',
      joiningDate: new Date(),
    });
    console.log(`Admin account ${email} created.`);
    if (!process.env.ADMIN_PASSWORD) {
      console.warn('Using the default password "admin123". Change it immediately or set ADMIN_PASSWORD.');
    }
  }
}

createAdmin()
  .catch((err) => {
    console.error('Failed to create admin:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
