const express = require('express');
const { body, param, query } = require('express-validator');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { HttpError, asyncHandler } = require('../utils/http');
const {
  parseDateOnly,
  startOfUtcDay,
  addDays,
  countDaysInclusive,
  monthWindowStart,
  buildMonthlySeries,
} = require('../utils/dates');
const { LEAVE_TYPES, LEAVE_STATUSES } = require('../constants');
const { findHolidaysInRange } = require('../services/holidays');
const notifications = require('../services/notifications');

const router = express.Router();
router.use(authenticate);

const EMPLOYEE_FIELDS = 'name email department position';

const dateOnly = (field, label) =>
  body(field)
    .custom((value) => parseDateOnly(value) !== null)
    .withMessage(`${label} must be a valid date (YYYY-MM-DD)`);

const countByStatus = (rows) => {
  const counts = { pending: 0, approved: 0, rejected: 0 };
  rows.forEach((row) => {
    counts[row._id] = row.count;
  });
  return { ...counts, total: counts.pending + counts.approved + counts.rejected };
};

const monthlyPipeline = (match, months) => [
  { $match: { ...match, createdAt: { $gte: monthWindowStart(months) } } },
  {
    $group: {
      _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      count: { $sum: 1 },
    },
  },
];

// @route   POST /api/leaves
// @access  Employee
router.post(
  '/',
  authorize('employee'),
  validate([
    dateOnly('startDate', 'Start date'),
    dateOnly('endDate', 'End date'),
    body('leaveType').isIn(LEAVE_TYPES).withMessage('Choose a valid leave type'),
    body('reason')
      .isString()
      .withMessage('Reason is required')
      .bail()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Reason must be between 10 and 1000 characters'),
  ]),
  asyncHandler(async (req, res) => {
    const { leaveType, reason } = req.body;
    const start = parseDateOnly(req.body.startDate);
    const end = parseDateOnly(req.body.endDate);
    const employee = req.user;

    if (end < start) throw new HttpError(400, 'End date must be on or after the start date');

    // One day of slack so a user whose local date is ahead of UTC can still
    // request leave starting "today".
    if (start < addDays(startOfUtcDay(), -1)) {
      throw new HttpError(400, 'Start date cannot be in the past');
    }

    const holidays = await findHolidaysInRange(start, end);
    if (holidays.length > 0) {
      const names = holidays.map((h) => h.name).join(', ');
      throw new HttpError(400, `The selected dates include a holiday (${names}). Adjust your dates around it.`);
    }

    const overlapping = await LeaveRequest.exists({
      employee: employee._id,
      status: { $in: ['pending', 'approved'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });
    if (overlapping) {
      throw new HttpError(409, 'You already have a pending or approved request that overlaps these dates');
    }

    const totalDays = countDaysInclusive(start, end);
    const available = employee.leaveBalance[leaveType];
    if (available < totalDays) {
      throw new HttpError(
        400,
        `Not enough ${leaveType} leave: ${totalDays} day${totalDays === 1 ? '' : 's'} requested, ${available} available`
      );
    }

    const leave = await LeaveRequest.create({
      employee: employee._id,
      leaveType,
      reason,
      startDate: start,
      endDate: end,
      totalDays,
      department: employee.department,
    });

    notifications.leaveSubmitted(req.app, leave, employee);
    await leave.populate('employee', EMPLOYEE_FIELDS);
    res.status(201).json(leave);
  })
);

// @route   GET /api/leaves?status=pending
// @desc    Employees see their own requests, managers their department's,
//          admins everyone's.
router.get(
  '/',
  validate([query('status').optional().isIn(LEAVE_STATUSES).withMessage('Invalid status filter')]),
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.user.role === 'employee') filter.employee = req.user._id;
    if (req.user.role === 'manager') filter.department = req.user.department;
    if (req.query.status) filter.status = req.query.status;

    // Managers see the requester's balance to make an informed decision.
    const employeeFields = req.user.role === 'employee' ? EMPLOYEE_FIELDS : `${EMPLOYEE_FIELDS} leaveBalance`;

    const leaves = await LeaveRequest.find(filter)
      .populate('employee', employeeFields)
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });
    res.json(leaves);
  })
);

// @route   GET /api/leaves/employee/stats
// @access  Any signed-in user (their own requests)
router.get(
  '/employee/stats',
  asyncHandler(async (req, res) => {
    const match = { employee: req.user._id };
    const [statusRows, typeRows, monthlyRows, recent] = await Promise.all([
      LeaveRequest.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      LeaveRequest.aggregate([
        { $match: { ...match, status: 'approved' } },
        { $group: { _id: '$leaveType', days: { $sum: '$totalDays' } } },
      ]),
      LeaveRequest.aggregate(monthlyPipeline(match, 12)),
      LeaveRequest.find(match).sort({ createdAt: -1 }).limit(5),
    ]);

    const daysTaken = { annual: 0, sick: 0, casual: 0 };
    typeRows.forEach((row) => {
      daysTaken[row._id] = row.days;
    });

    res.json({
      counts: countByStatus(statusRows),
      daysTaken,
      monthly: buildMonthlySeries(monthlyRows, 12),
      recent,
    });
  })
);

// @route   GET /api/leaves/manager/stats
// @access  Manager (own department)
router.get(
  '/manager/stats',
  authorize('manager'),
  asyncHandler(async (req, res) => {
    const department = req.user.department;
    const match = { department };
    const today = startOfUtcDay();
    const [statusRows, monthlyRows, onLeaveToday, teamSize] = await Promise.all([
      LeaveRequest.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      LeaveRequest.aggregate(monthlyPipeline(match, 6)),
      LeaveRequest.countDocuments({ ...match, status: 'approved', startDate: { $lte: today }, endDate: { $gte: today } }),
      User.countDocuments({ department, role: 'employee', isActive: true }),
    ]);

    res.json({
      department,
      teamSize,
      onLeaveToday,
      counts: countByStatus(statusRows),
      monthly: buildMonthlySeries(monthlyRows, 6),
    });
  })
);

// @route   PATCH /api/leaves/:id
// @desc    Approve or reject a pending request
// @access  Manager (same department)
router.patch(
  '/:id',
  authorize('manager'),
  validate([
    param('id').isMongoId().withMessage('Invalid leave request id'),
    body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
    body('managerNote').optional({ values: 'null' }).isString().trim().isLength({ max: 500 }).withMessage('Note is too long'),
  ]),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const managerNote = req.body.managerNote || undefined;

    // Atomically claim the request: only a pending request in the manager's
    // department can transition, so two concurrent decisions cannot both win.
    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, department: req.user.department, status: 'pending' },
      { $set: { status, manager: req.user._id, ...(managerNote && { managerNote }) } },
      { new: true }
    );

    if (!leave) {
      const existing = await LeaveRequest.findById(req.params.id).select('department status');
      if (!existing) throw new HttpError(404, 'Leave request not found');
      if (existing.department !== req.user.department) {
        throw new HttpError(403, 'You can only review requests from your own department');
      }
      throw new HttpError(409, `This request has already been ${existing.status}`);
    }

    if (status === 'approved') {
      const balancePath = `leaveBalance.${leave.leaveType}`;
      const debit = await User.updateOne(
        { _id: leave.employee, [balancePath]: { $gte: leave.totalDays } },
        { $inc: { [balancePath]: -leave.totalDays } }
      );
      if (debit.modifiedCount === 0) {
        // Roll the claim back so the request can be reconsidered later.
        await LeaveRequest.updateOne(
          { _id: leave._id, status: 'approved' },
          { $set: { status: 'pending' }, $unset: { manager: 1, managerNote: 1 } }
        );
        throw new HttpError(400, `The employee no longer has enough ${leave.leaveType} leave for this request`);
      }
    }

    await leave.populate([
      { path: 'employee', select: `${EMPLOYEE_FIELDS} leaveBalance` },
      { path: 'manager', select: 'name email' },
    ]);
    notifications.leaveDecided(req.app, leave);
    res.json(leave);
  })
);

module.exports = router;
