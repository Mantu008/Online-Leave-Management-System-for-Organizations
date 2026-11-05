const ROLES = Object.freeze(['employee', 'manager', 'admin']);
const LEAVE_TYPES = Object.freeze(['annual', 'sick', 'casual']);
const LEAVE_STATUSES = Object.freeze(['pending', 'approved', 'rejected']);
const HOLIDAY_TYPES = Object.freeze(['public', 'company', 'optional']);

// Yearly entitlement a new account starts with. Kept in one place so the
// model default, legacy-account backfill and API responses never disagree.
const DEFAULT_LEAVE_BALANCE = Object.freeze({ annual: 20, sick: 10, casual: 10 });

module.exports = {
  ROLES,
  LEAVE_TYPES,
  LEAVE_STATUSES,
  HOLIDAY_TYPES,
  DEFAULT_LEAVE_BALANCE,
};
