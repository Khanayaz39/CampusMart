const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes.
 * Checks for a valid JWT token in the Authorization header.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ message: 'Not authorized, invalid token' });
      }

      // Verify token using secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB and attach to req object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user || req.user.isDeleted) {
        return res.status(401).json({ message: 'Not authorized, user not found or account deleted' });
      }
      
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Middleware to restrict access to admins only.
 * Must be used after the 'protect' middleware.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, adminOnly };
