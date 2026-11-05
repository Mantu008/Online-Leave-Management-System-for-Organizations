const { validationResult } = require('express-validator');

/**
 * Run express-validator chains and reply 400 with a consistent shape:
 * { message, errors: [{ field, message }] }
 */
const validate = (chains) => [
  ...chains,
  (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    const errors = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg }));
    return res.status(400).json({ message: errors[0].message, errors });
  },
];

module.exports = { validate };
