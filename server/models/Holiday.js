const mongoose = require('mongoose');
const { HOLIDAY_TYPES } = require('../constants');

const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    type: { type: String, enum: HOLIDAY_TYPES, required: true },
    description: { type: String, trim: true, default: '' },
    // A recurring holiday repeats on the same month and day every year from
    // its original date onwards.
    isRecurring: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { versionKey: false } }
);

holidaySchema.index({ date: 1 });
holidaySchema.index({ isRecurring: 1, date: 1 });

module.exports = mongoose.model('Holiday', holidaySchema);
