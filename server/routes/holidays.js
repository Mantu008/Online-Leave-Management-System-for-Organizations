const express = require('express');
const { body, param, query } = require('express-validator');
const Holiday = require('../models/Holiday');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { HttpError, asyncHandler } = require('../utils/http');
const { parseDateOnly, yearRange } = require('../utils/dates');
const { HOLIDAY_TYPES } = require('../constants');
const { findHolidaysInRange } = require('../services/holidays');
const notifications = require('../services/notifications');

const router = express.Router();
router.use(authenticate);

const holidayRules = (isUpdate) => {
  const maybe = (chain) => (isUpdate ? chain.optional() : chain);
  return [
    maybe(body('name')).isString().trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    maybe(body('date'))
      .custom((value) => parseDateOnly(value) !== null)
      .withMessage('Date must be a valid date (YYYY-MM-DD)'),
    maybe(body('type')).isIn(HOLIDAY_TYPES).withMessage('Choose a valid holiday type'),
    body('description').optional({ values: 'null' }).isString().trim().isLength({ max: 500 }),
    body('isRecurring').optional().isBoolean().withMessage('Recurring must be true or false').toBoolean(),
  ];
};

// @route   GET /api/holidays?year=2025
// @access  Any signed-in user
router.get(
  '/',
  validate([query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Invalid year').toInt()]),
  asyncHandler(async (req, res) => {
    const year = req.query.year || new Date().getUTCFullYear();
    const { start, end } = yearRange(year);
    res.json(await findHolidaysInRange(start, end));
  })
);

// @route   POST /api/holidays
// @access  Admin
router.post(
  '/',
  authorize('admin'),
  validate(holidayRules(false)),
  asyncHandler(async (req, res) => {
    const { name, type, description = '', isRecurring = false } = req.body;
    const holiday = await Holiday.create({
      name,
      type,
      description,
      isRecurring,
      date: parseDateOnly(req.body.date),
      createdBy: req.user._id,
    });
    notifications.holidayAnnounced(req.app, holiday);
    res.status(201).json(holiday);
  })
);

// @route   PATCH /api/holidays/:id
// @access  Admin
router.patch(
  '/:id',
  authorize('admin'),
  validate([param('id').isMongoId().withMessage('Invalid holiday id'), ...holidayRules(true)]),
  asyncHandler(async (req, res) => {
    const updates = { updatedBy: req.user._id };
    ['name', 'type', 'description', 'isRecurring'].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (req.body.date !== undefined) updates.date = parseDateOnly(req.body.date);

    const holiday = await Holiday.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!holiday) throw new HttpError(404, 'Holiday not found');
    res.json(holiday);
  })
);

// @route   DELETE /api/holidays/:id
// @access  Admin
router.delete(
  '/:id',
  authorize('admin'),
  validate([param('id').isMongoId().withMessage('Invalid holiday id')]),
  asyncHandler(async (req, res) => {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) throw new HttpError(404, 'Holiday not found');
    res.json({ message: 'Holiday deleted' });
  })
);

module.exports = router;
