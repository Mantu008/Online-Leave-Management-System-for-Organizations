const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const { authenticate, signToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { HttpError, asyncHandler } = require('../utils/http');
const { sendLoginNotification, isMailConfigured } = require('../utils/email');
const notifications = require('../services/notifications');
const userRules = require('../validators/userRules');
const { DEMO_ACCOUNTS, isDemoLoginEnabled, getDemoUser } = require('../services/demoAccounts');

const router = express.Router();

// @route   POST /api/auth/register
// @access  Public
// Self-registration always creates an employee account. Manager and admin
// roles are granted by an administrator from User Management.
router.post(
  '/register',
  validate([
    userRules.name(),
    userRules.email(),
    userRules.password(),
    userRules.department(),
    userRules.position(),
    userRules.joiningDate(),
  ]),
  asyncHandler(async (req, res) => {
    const { name, email, password, department, position, joiningDate } = req.body;

    if (await User.exists({ email })) {
      throw new HttpError(409, 'An account with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      position,
      joiningDate,
      role: 'employee',
    });

    notifications.userRegistered(req.app, user);
    res.status(201).json({ token: signToken(user), user });
  })
);

// @route   POST /api/auth/login
// @access  Public
router.post(
  '/login',
  validate([userRules.email(), body('password').isString().notEmpty().withMessage('Password is required')]),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Same response for unknown email and wrong password.
    if (!user || !(await user.comparePassword(password))) {
      throw new HttpError(400, 'Invalid email or password');
    }
    if (!user.isActive) {
      throw new HttpError(403, 'This account has been deactivated. Contact your administrator.');
    }

    user.lastLogin = new Date();
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: user.lastLogin } });

    if (isMailConfigured()) {
      // Never block or fail a login on email delivery.
      sendLoginNotification(user.email, user.name, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: user.lastLogin.toISOString(),
      }).catch((err) => console.warn('[mail] login notification failed:', err.message));
    }

    res.json({ token: signToken(user), user });
  })
);

// @route   POST /api/auth/demo
// @access  Public (unless DEMO_LOGIN=false)
// Signs in as a ready-made demo account for the given role.
router.post(
  '/demo',
  validate([body('role').isIn(Object.keys(DEMO_ACCOUNTS)).withMessage('Unknown demo role')]),
  asyncHandler(async (req, res) => {
    if (!isDemoLoginEnabled()) throw new HttpError(404, 'Demo login is disabled');

    const user = await getDemoUser(req.body.role);
    user.lastLogin = new Date();
    await User.updateOne({ _id: user._id }, { $set: { lastLogin: user.lastLogin } });

    res.json({ token: signToken(user), user });
  })
);

// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

// @route   GET /api/auth/test-email
// @access  Development only — verifies SMTP settings.
if (process.env.NODE_ENV !== 'production') {
  router.get(
    '/test-email',
    asyncHandler(async (req, res) => {
      if (!isMailConfigured()) throw new HttpError(400, 'GMAIL_USER and GMAIL_PASS are not set');
      await sendLoginNotification(process.env.GMAIL_USER, 'Test User', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
      });
      res.json({ message: `Test email sent to ${process.env.GMAIL_USER}` });
    })
  );
}

module.exports = router;
