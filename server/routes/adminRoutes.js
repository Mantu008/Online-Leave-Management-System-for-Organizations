const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');
const Department = require('../models/Department');
const LeaveRequest = require('../models/LeaveRequest');

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(isAdmin);

// User management routes
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Holiday management routes
router.get('/holidays', adminController.getAllHolidays);
router.post('/holidays', adminController.createHoliday);
router.put('/holidays/:id', adminController.updateHoliday);
router.delete('/holidays/:id', adminController.deleteHoliday);

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get user role distribution
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get pending leave requests
    const pendingRequests = await LeaveRequest.countDocuments({ status: 'pending' });

    // Get unique departments count from users
    const uniqueDepartments = await User.distinct('department');
    const departments = uniqueDepartments.filter(dept => dept).length;

    // Get holidays this month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const holidaysThisMonth = await Holiday.countDocuments({
      date: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth
      }
    });

    // Format user roles data
    const formattedUserRoles = {
      employee: 0,
      manager: 0,
      admin: 0
    };

    userRoles.forEach(role => {
      formattedUserRoles[role._id] = role.count;
    });

    res.json({
      totalUsers,
      pendingRequests,
      departments,
      holidaysThisMonth,
      userRoles: formattedUserRoles
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLeaves = await LeaveRequest.countDocuments();
    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'pending' });
    const approvedLeaves = await LeaveRequest.countDocuments({ status: 'approved' });
    const rejectedLeaves = await LeaveRequest.countDocuments({ status: 'rejected' });
    const totalHolidays = await Holiday.countDocuments();

    res.json({
      totalUsers,
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      totalHolidays,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 