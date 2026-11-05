// Lists administrator accounts. Usage: node scripts/checkAdmin.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admins = await User.find({ role: 'admin' }).select('email department isActive');
  if (admins.length === 0) {
    console.log('No admin accounts found. Run: node scripts/createAdmin.js');
  } else {
    admins.forEach((a) => console.log(`${a.email}  ${a.department}  ${a.isActive ? 'active' : 'inactive'}`));
  }
}

checkAdmin()
  .catch((err) => {
    console.error('Failed to check admins:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
