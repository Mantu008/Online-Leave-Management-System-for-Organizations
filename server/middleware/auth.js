const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if user's role matches the required role
        const requiredRole = req.header('X-User-Role');
        if (requiredRole && user.role !== requiredRole) {
            return res.status(403).json({ message: `User role ${user.role} is not authorized to access this route` });
        }

        // Check if user's department matches the required department
        const requiredDepartment = req.header('X-User-Department');
        if (requiredDepartment && user.department !== requiredDepartment) {
            return res.status(403).json({ message: `User department ${user.department} is not authorized to access this department's data` });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

module.exports = auth; 