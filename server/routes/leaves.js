const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const LeaveRequest = require('../models/LeaveRequest');
const Holiday = require('../models/Holiday');
const User = require('../models/User');

// @route   POST /api/leaves
// @desc    Create a leave request
// @access  Private (Employee)
router.post('/', [
  auth,
  body('startDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Start date must be in YYYY-MM-DD format'),
  body('endDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('End date must be in YYYY-MM-DD format'),
  body('leaveType').isIn(['annual', 'sick', 'casual']).withMessage('Invalid leave type'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('totalDays').isInt({ min: 1 }).withMessage('Total days must be a positive number')
], async (req, res) => {
  // Check if user is an employee
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Only employees can create leave requests' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { startDate, endDate, leaveType, reason, totalDays } = req.body;
    
    // Check if dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Check for holidays
    const holidays = await Holiday.find({
      date: {
        $gte: start,
        $lte: end
      }
    });

    if (holidays.length > 0) {
      return res.status(400).json({
        message: 'Leave request overlaps with holidays',
        holidays
      });
    }

    // Check leave balance
    const user = await User.findById(req.user._id);
    if (user.leaveBalance[leaveType] < totalDays) {
      return res.status(400).json({ 
        message: `Insufficient ${leaveType} leave balance. You have ${user.leaveBalance[leaveType]} days remaining.` 
      });
    }

    // Create leave request
    const leaveRequest = new LeaveRequest({
      employee: req.user._id,
      startDate,
      endDate,
      leaveType,
      reason,
      totalDays,
      department: user.department
    });

    await leaveRequest.save();

    res.json(leaveRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error while creating leave request' });
  }
});

// @route   GET /api/leaves
// @desc    Get all leave requests (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let leaves;
    
    if (req.user.role === 'admin') {
      // Admin can see all leaves
      leaves = await LeaveRequest.find()
        .populate('employee', 'name email')
        .populate('manager', 'name email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'manager') {
      // Manager can see department leaves
      leaves = await LeaveRequest.find({ department: req.user.department })
        .populate('employee', 'name email')
        .populate('manager', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Employee can see their own leaves
      leaves = await LeaveRequest.find({ employee: req.user._id })
        .populate('employee', 'name email')
        .populate('manager', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(leaves);
  } catch (err) {
    console.error('Get leaves error:', err);
    res.status(500).json({ message: 'Server error while fetching leaves' });
  }
});

// @route   GET /api/leaves/department
// @desc    Get all leave requests for a department
// @access  Private (Manager)
router.get('/department', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can view department leaves' });
    }

    const leaves = await LeaveRequest.find({ department: req.user.department })
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error while fetching department leaves' });
  }
});

// @route   PATCH /api/leaves/:id
// @desc    Update leave request status
// @access  Private (Manager)
router.patch('/:id', [
  auth,
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status'),
  body('managerNote').optional()
], async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can update leave requests' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status, managerNote } = req.body;
    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate('employee', 'name email department');

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if manager is from same department
    if (leaveRequest.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized to update this leave request' });
    }

    leaveRequest.status = status;
    leaveRequest.manager = req.user._id;
    if (managerNote) leaveRequest.managerNote = managerNote;

    // Update leave balance if approved
    if (status === 'approved') {
      const employee = await User.findById(leaveRequest.employee);
      employee.leaveBalance[leaveRequest.leaveType] -= leaveRequest.totalDays;
      await employee.save();
    }

    await leaveRequest.save();

    // Emit notification to employee
    const io = req.app.get('io');
    io.to(leaveRequest.employee._id.toString()).emit('leaveStatusUpdate', {
      type: 'leaveStatusUpdate',
      message: `Your leave request from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()} has been ${status}`,
      leaveRequest: {
        id: leaveRequest._id,
        status,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        leaveType: leaveRequest.leaveType,
        managerNote
      }
    });

    // Emit notification to department
    io.to(leaveRequest.department).emit('departmentLeaveUpdate', {
      type: 'departmentLeaveUpdate',
      message: `${leaveRequest.employee.name}'s leave request from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()} has been ${status}`,
      leaveRequest: {
        id: leaveRequest._id,
        employee: leaveRequest.employee.name,
        status,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        leaveType: leaveRequest.leaveType
      }
    });

    res.json(leaveRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error while updating leave request' });
  }
});

// @route   GET /api/leaves/team
// @desc    Get all leave requests for manager's team
// @access  Private (Manager)
router.get('/team', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can view team leaves' });
    }

    const leaves = await LeaveRequest.find({ department: req.user.department })
      .populate('employee', 'name email')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error('Get team leaves error:', err);
    res.status(500).json({ message: 'Server error while fetching team leaves' });
  }
});

// Get leaves for logged-in user
router.get('/my-leaves', auth, async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.user._id })
      .populate('employee', 'name email department')
      .sort({ createdAt: -1 });
    
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching user leaves:', error);
    res.status(500).json({ message: 'Error fetching leaves' });
  }
});

module.exports = router; 