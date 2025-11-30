const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generate JWT token for authenticated user
 * @param {Object} user - User object with user_id, email, role, family_id (optional)
 * @returns {String} Signed JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user.user_id,
    email: user.email,
    role: user.role,
    ...(user.family_id && { family_id: user.family_id }) // Include family_id if present
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};

/**
 * Verify and decode JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken
};

