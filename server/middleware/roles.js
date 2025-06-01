// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
};

// Middleware to check if user is manager
exports.isManager = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Manager only.' });
  }
};

// Middleware to check if user is employee or above
exports.isEmployee = (req, res, next) => {
  if (req.user && ['employee', 'manager', 'admin'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Employee only.' });
  }
}; 