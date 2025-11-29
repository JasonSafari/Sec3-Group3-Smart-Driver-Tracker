const { verifyToken } = require('../config/jwt');

/**
 * Middleware to authenticate JWT token
 * Extracts token from Authorization header and verifies it
 * Attaches decoded user info to req.user
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    // Extract token from "Bearer TOKEN" format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. Invalid token format.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token.',
      message: error.message
    });
  }
};

module.exports = { authenticateToken };

