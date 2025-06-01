const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['annual', 'sick', 'casual'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  managerNote: {
    type: String
  },
  totalDays: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Calculate total days before saving
leaveRequestSchema.pre('save', function(next) {
  try {
    // Ensure dates are Date objects
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    
    // Calculate total days
    const oneDay = 24 * 60 * 60 * 1000;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / oneDay) + 1; // +1 to include both start and end dates
    
    // Set totalDays
    this.totalDays = diffDays;
    
    next();
  } catch (error) {
    next(error);
  }
});

// Validate dates before saving
leaveRequestSchema.pre('save', function(next) {
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return next(new Error('Invalid date format'));
  }
  
  if (endDate < startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  next();
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema); 