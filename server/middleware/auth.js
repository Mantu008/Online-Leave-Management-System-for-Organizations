const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Received token:', token ? 'Present' : 'Missing'); // Debug log
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded); // Debug log

            const user = await User.findById(decoded.userId);
            console.log('Found user:', user ? { id: user._id, role: user.role } : 'Not found'); // Debug log

            if (!user) {
                console.log('User not found in database'); // Debug log
                return res.status(401).json({ message: 'User not found' });
            }

            // Add user info to request
            req.user = user;
            req.token = token;

            // Role and department checks are now optional and only used for additional validation
            const requiredRole = req.header('X-User-Role');
            if (requiredRole && user.role !== requiredRole) {
                console.log(`Role mismatch: Required ${requiredRole}, User has ${user.role}`); // Debug log
                return res.status(403).json({ message: `User role ${user.role} is not authorized to access this route` });
            }

            const requiredDepartment = req.header('X-User-Department');
            if (requiredDepartment && user.department !== requiredDepartment) {
                console.log(`Department mismatch: Required ${requiredDepartment}, User has ${user.department}`); // Debug log
                return res.status(403).json({ message: `User department ${user.department} is not authorized to access this department's data` });
            }

            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError); // Debug log
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid authentication token' });
            }
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Authentication token has expired' });
            }
            throw jwtError;
        }
    } catch (error) {
        console.error('Auth middleware error:', error); // Debug log
        res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = auth; 