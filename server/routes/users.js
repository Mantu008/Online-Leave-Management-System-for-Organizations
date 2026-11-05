const express = require('express');
const { body, param } = require('express-validator');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { HttpError, asyncHandler } = require('../utils/http');
const userRules = require('../validators/userRules');
const { LEAVE_TYPES } = require('../constants');

const router = express.Router();
router.use(authenticate, authorize('admin'));

const idRule = param('id').isMongoId().withMessage('Invalid user id');

// @route   GET /api/users
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await User.find().sort({ name: 1 }));
  })
);

// @route   GET /api/users/:id
router.get(
  '/:id',
  validate([idRule]),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new HttpError(404, 'User not found');
    res.json(user);
  })
);

// @route   POST /api/users
router.post(
  '/',
  validate([
    userRules.name(),
    userRules.email(),
    userRules.password(),
    userRules.role(),
    userRules.department(),
    userRules.position(),
    userRules.joiningDate(),
  ]),
  asyncHandler(async (req, res) => {
    const { name, email, password, role, department, position, joiningDate } = req.body;
    if (await User.exists({ email })) throw new HttpError(409, 'An account with this email already exists');
    const user = await User.create({ name, email, password, role, department, position, joiningDate });
    res.status(201).json(user);
  })
);

// @route   PUT /api/users/:id
router.put(
  '/:id',
  validate([
    idRule,
    userRules.optional(userRules.name()),
    userRules.optional(userRules.email()),
    userRules.optional(userRules.role()),
    userRules.optional(userRules.department()),
    userRules.optional(userRules.position()),
    userRules.optional(userRules.joiningDate()),
    body('isActive').optional().isBoolean().withMessage('Active must be true or false').toBoolean(),
    ...LEAVE_TYPES.map((type) =>
      body(`leaveBalance.${type}`)
        .optional()
        .isInt({ min: 0, max: 365 })
        .withMessage(`${type} balance must be a whole number of days`)
        .toInt()
    ),
  ]),
  asyncHandler(async (req, res) => {
    const isSelf = String(req.user._id) === req.params.id;
    if (isSelf && req.body.role !== undefined && req.body.role !== 'admin') {
      throw new HttpError(400, 'You cannot remove your own administrator role');
    }
    if (isSelf && req.body.isActive === false) {
      throw new HttpError(400, 'You cannot deactivate your own account');
    }

    const updates = {};
    ['name', 'email', 'role', 'department', 'position', 'joiningDate', 'isActive'].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    LEAVE_TYPES.forEach((type) => {
      const value = req.body.leaveBalance && req.body.leaveBalance[type];
      if (value !== undefined) updates[`leaveBalance.${type}`] = value;
    });

    if (updates.email && (await User.exists({ email: updates.email, _id: { $ne: req.params.id } }))) {
      throw new HttpError(409, 'An account with this email already exists');
    }

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!user) throw new HttpError(404, 'User not found');
    res.json(user);
  })
);

// @route   DELETE /api/users/:id
// Leave history is kept for audit purposes; clients show it as a removed user.
router.delete(
  '/:id',
  validate([idRule]),
  asyncHandler(async (req, res) => {
    if (String(req.user._id) === req.params.id) throw new HttpError(400, 'You cannot delete your own account');
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ message: 'User deleted' });
  })
);

module.exports = router;
