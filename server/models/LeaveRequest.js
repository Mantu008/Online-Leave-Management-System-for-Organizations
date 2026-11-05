const mongoose = require('mongoose');
const { LEAVE_TYPES, LEAVE_STATUSES } = require('../constants');
const { countDaysInclusive } = require('../utils/dates');

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: { type: String, enum: LEAVE_TYPES, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: LEAVE_STATUSES, default: 'pending' },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    managerNote: { type: String, trim: true },
    totalDays: { type: Number, required: true, min: 1 },
    department: { type: String, required: true },
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

leaveRequestSchema.index({ employee: 1, createdAt: -1 });
leaveRequestSchema.index({ department: 1, status: 1, createdAt: -1 });

// totalDays is always derived from the dates here, never trusted from input.
leaveRequestSchema.pre('validate', function deriveTotalDays(next) {
  if (this.startDate && this.endDate) {
    if (this.endDate < this.startDate) {
      this.invalidate('endDate', 'End date must be on or after the start date');
    } else {
      this.totalDays = countDaysInclusive(this.startDate, this.endDate);
    }
  }
  next();
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
