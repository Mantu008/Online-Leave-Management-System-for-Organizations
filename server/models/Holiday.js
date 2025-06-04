const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['public', 'company', 'optional'],
    required: true
  },
  description: {
    type: String
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient date queries
holidaySchema.index({ date: 1 });

module.exports = mongoose.model('Holiday', holidaySchema); 