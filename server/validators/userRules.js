// Validation rules shared by registration and admin user management, so both
// paths accept exactly the same data.
const { body } = require('express-validator');
const { ROLES } = require('../constants');

const required = (field, label) =>
  body(field).isString().withMessage(`${label} is required`).bail().trim().notEmpty().withMessage(`${label} is required`);

const optional = (rule) => rule.optional();

const rules = {
  name: () => required('name', 'Name').isLength({ max: 100 }).withMessage('Name is too long'),
  email: () =>
    body('email')
      .isString()
      .withMessage('Email is required')
      .bail()
      .trim()
      .toLowerCase()
      .isEmail()
      .withMessage('Enter a valid email address'),
  password: () =>
    body('password')
      .isString()
      .withMessage('Password is required')
      .bail()
      .isLength({ min: 6, max: 128 })
      .withMessage('Password must be at least 6 characters'),
  department: () => required('department', 'Department').isLength({ max: 60 }),
  position: () => required('position', 'Position').isLength({ max: 80 }),
  joiningDate: () =>
    body('joiningDate')
      .isISO8601({ strict: true })
      .withMessage('Enter a valid joining date')
      .bail()
      .toDate()
      .custom((value) => value <= new Date())
      .withMessage('Joining date cannot be in the future'),
  role: () => body('role').isIn(ROLES).withMessage('Choose a valid role'),
};

module.exports = { ...rules, optional };
