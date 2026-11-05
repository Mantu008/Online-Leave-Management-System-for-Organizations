const express = require('express');
const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../utils/http');
const { monthWindowStart, buildMonthlySeries, startOfUtcDay } = require('../utils/dates');
const { findHolidaysInRange } = require('../services/holidays');

const router = express.Router();
router.use(authenticate, authorize('admin'));

const statusSums = {
  approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
  pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
  rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
};

// @route   GET /api/admin/stats
// @desc    Organisation-wide figures for the admin dashboard
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    const today = startOfUtcDay(now);

    const [roleRows, departments, statusRows, departmentRows, monthlyRows, holidaysThisMonth, onLeaveToday] =
      await Promise.all([
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        User.distinct('department'),
        LeaveRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        LeaveRequest.aggregate([
          { $group: { _id: '$department', total: { $sum: 1 }, ...statusSums } },
          { $sort: { total: -1 } },
        ]),
        LeaveRequest.aggregate([
          { $match: { createdAt: { $gte: monthWindowStart(6, now) } } },
          {
            $group: {
              _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
              count: { $sum: 1 },
              ...statusSums,
            },
          },
        ]),
        findHolidaysInRange(monthStart, monthEnd),
        LeaveRequest.countDocuments({ status: 'approved', startDate: { $lte: today }, endDate: { $gte: today } }),
      ]);

    const users = { employee: 0, manager: 0, admin: 0 };
    roleRows.forEach((row) => {
      users[row._id] = row.count;
    });
    const requests = { pending: 0, approved: 0, rejected: 0 };
    statusRows.forEach((row) => {
      requests[row._id] = row.count;
    });

    res.json({
      users: { ...users, total: users.employee + users.manager + users.admin },
      departments: departments.filter(Boolean).length,
      requests: { ...requests, total: requests.pending + requests.approved + requests.rejected },
      holidaysThisMonth: holidaysThisMonth.length,
      onLeaveToday,
      byDepartment: departmentRows.map(({ _id, ...rest }) => ({ department: _id, ...rest })),
      monthly: buildMonthlySeries(monthlyRows, 6, ['count', 'approved', 'pending', 'rejected'], now),
    });
  })
);

module.exports = router;
