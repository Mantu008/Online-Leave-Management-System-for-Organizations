const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { HttpError, asyncHandler } = require('../utils/http');

const TOKEN_TTL = '24h';

function signToken(user) {
  return jwt.sign({ userId: String(user._id) }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

/** Resolve a bearer token to an active user document, or throw a 401. */
async function userFromToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new HttpError(401, err.name === 'TokenExpiredError' ? 'Your session has expired' : 'Invalid session');
  }
  const user = payload && payload.userId ? await User.findById(payload.userId) : null;
  if (!user) throw new HttpError(401, 'Invalid session');
  if (!user.isActive) throw new HttpError(401, 'This account has been deactivated');
  return user;
}

/** Requires a valid `Authorization: Bearer <token>` header; sets req.user. */
const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Authentication required');
  req.user = await userFromToken(token);
  next();
});

/** Restricts a route to the given roles. Use after `authenticate`. */
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpError(403, 'You do not have permission to perform this action'));
  }
  return next();
};

module.exports = { authenticate, authorize, signToken, userFromToken };
