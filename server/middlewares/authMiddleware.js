const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token);
    } else {
      console.log('No token in headers:', req.headers);
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      if (!decoded.userId) {
        console.log('No userId in token');
        return res.status(401).json({ message: 'Invalid token format' });
      }

      // Convert string ID to ObjectId
      const userId = new mongoose.Types.ObjectId(decoded.userId);
      console.log('Looking for user with ID:', userId);
      
      const user = await User.findById(userId).select('-password');
      console.log('User found:', user ? { id: user._id, role: user.role } : 'No user found');
      
      if (!user) {
        console.log('User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
  } catch (error) {
    console.error('Protect middleware error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.isAdmin = (req, res, next) => {
  console.log('Checking admin role for user:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
  
  if (!req.user) {
    console.log('No user in request');
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role === 'admin') {
    console.log('User is admin, proceeding');
    next();
  } else {
    console.log('Admin check failed:', `User role is ${req.user.role}`);
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

exports.isManager = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as manager' });
  }
}; 