const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, DEFAULT_LEAVE_BALANCE } = require('../constants');

const leaveBalanceSchema = new mongoose.Schema(
  {
    annual: { type: Number, default: DEFAULT_LEAVE_BALANCE.annual, min: 0 },
    sick: { type: Number, default: DEFAULT_LEAVE_BALANCE.sick, min: 0 },
    casual: { type: Number, default: DEFAULT_LEAVE_BALANCE.casual, min: 0 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'employee' },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },
    leaveBalance: { type: leaveBalanceSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      // The password hash must never leave the server, whichever route
      // serialises a user document.
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ department: 1, role: 1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
