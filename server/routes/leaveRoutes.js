const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

// Get all leave requests (admin only)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view all leave requests' });
        }
        const leaves = await LeaveRequest.find().populate('user', 'name email department');
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get my leave requests
router.get('/my-leaves', auth, async (req, res) => {
    try {
        console.log('Fetching leaves for user:', req.user._id);
        
        // Find leaves for the user
        const leaves = await LeaveRequest.find({ employee: req.user._id })
            .populate('employee', 'name email department')
            .sort({ createdAt: -1 });
        
        console.log('Found leaves:', leaves);

        // Get user's leave balance with all fields
        const user = await User.findById(req.user._id);
        console.log('User found:', user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get leave balance from user document
        const leaveBalance = {
            casual: user.leaveBalance?.casual ?? 10,
            sick: user.leaveBalance?.sick ?? 10,
            annual: user.leaveBalance?.annual ?? 20
        };

        console.log('User leave balance:', leaveBalance);

        // Return both leaves and leave balance
        return res.status(200).json({
            data: {
                leaves: leaves || [],
                leaveBalance: leaveBalance
            }
        });
    } catch (error) {
        console.error('Error in /my-leaves:', error);
        return res.status(500).json({ 
            message: 'Error fetching leave history',
            error: error.message 
        });
    }
});

// Get department leave requests (manager only)
router.get('/department', auth, async (req, res) => {
    try {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Not authorized to view department leaves' });
        }
        const leaves = await LeaveRequest.find()
            .populate({
                path: 'user',
                match: { department: req.user.department }
            })
            .exec();
        
        // Filter out leaves where user is null (not in same department)
        const departmentLeaves = leaves.filter(leave => leave.user !== null);
        res.json(departmentLeaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get pending leave requests (admin only)
router.get('/pending', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view pending leaves' });
        }
        const leaves = await LeaveRequest.find({ status: 'pending' })
            .populate('employee', 'name email')
            .exec();
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create leave request
router.post('/', auth, async (req, res) => {
    try {
        const leaveRequest = new LeaveRequest({
            ...req.body,
            user: req.user._id,
            department: req.user.department
        });
        const newLeave = await leaveRequest.save();
        res.status(201).json(newLeave);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update leave request status (manager only)
router.patch('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Not authorized to update leave status' });
        }

        const leaveRequest = await LeaveRequest.findById(req.params.id)
            .populate('user', 'department');

        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Check if the leave request belongs to the manager's department
        if (leaveRequest.user.department !== req.user.department) {
            return res.status(403).json({ message: 'Not authorized to update leave requests from other departments' });
        }

        leaveRequest.status = req.body.status;
        const updatedLeave = await leaveRequest.save();
        res.json(updatedLeave);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get team leaves (manager only)
router.get('/team', auth, async (req, res) => {
    try {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Not authorized to view team leaves' });
        }
        const leaves = await LeaveRequest.find()
            .populate({
                path: 'user',
                match: { department: req.user.department }
            })
            .exec();
        
        // Filter out leaves where user is null (not in same department)
        const teamLeaves = leaves.filter(leave => leave.user !== null);
        res.json(teamLeaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 