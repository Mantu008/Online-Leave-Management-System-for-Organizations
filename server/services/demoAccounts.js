// One-click demo accounts, so visitors can explore each role without
// registering. The employee and manager share a department so the manager
// sees the employee's requests.
//
// Enabled by default; set DEMO_LOGIN=false to turn it off (e.g. for a real
// deployment where anyone becoming admin is unacceptable).
const crypto = require('crypto');
const User = require('../models/User');

const DEMO_DEPARTMENT = 'Engineering';

const DEMO_ACCOUNTS = Object.freeze({
  employee: {
    name: 'Demo Employee',
    email: 'demo.employee@leave-demo.com',
    department: DEMO_DEPARTMENT,
    position: 'Software Engineer',
  },
  manager: {
    name: 'Demo Manager',
    email: 'demo.manager@leave-demo.com',
    department: DEMO_DEPARTMENT,
    position: 'Engineering Manager',
  },
  admin: {
    name: 'Demo Admin',
    email: 'demo.admin@leave-demo.com',
    department: 'Administration',
    position: 'System Administrator',
  },
});

const isDemoLoginEnabled = () => String(process.env.DEMO_LOGIN ?? 'true').toLowerCase() !== 'false';

/**
 * Returns the demo user for a role, creating it on first use and repairing it
 * if someone changed its role, department or deactivated it while exploring.
 */
async function getDemoUser(role) {
  const profile = DEMO_ACCOUNTS[role];
  if (!profile) return null;

  let user = await User.findOne({ email: profile.email });
  if (!user) {
    // Demo accounts are only reachable through the demo endpoint, so the
    // password is random and never used.
    return User.create({
      ...profile,
      role,
      password: crypto.randomBytes(24).toString('hex'),
      joiningDate: new Date('2024-01-15'),
    });
  }

  if (user.role !== role || !user.isActive || user.department !== profile.department) {
    user.role = role;
    user.isActive = true;
    user.department = profile.department;
    await user.save();
  }
  return user;
}

module.exports = { DEMO_ACCOUNTS, isDemoLoginEnabled, getDemoUser };
