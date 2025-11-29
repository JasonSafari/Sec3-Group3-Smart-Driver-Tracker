const User = require('../models/User');

/**
 * Middleware to check if user has required role
 * @param {Array<String>} allowedRoles - Array of allowed roles (e.g., ['parent', 'teen'])
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Get user from database to check role
      const user = await User.findByPk(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: 'Access denied',
          message: `This endpoint requires one of the following roles: ${allowedRoles.join(', ')}`
        });
      }

      // Attach full user object to request
      req.userRole = user.role;
      req.userFull = user;
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        error: 'Failed to verify user role',
        message: error.message
      });
    }
  };
};

/**
 * Middleware to check if user is a parent
 */
const requireParent = requireRole('parent');

/**
 * Middleware to check if user is a teen
 */
const requireTeen = requireRole('teen');

/**
 * Middleware to check if user belongs to the same family
 * Used for family-scoped operations
 */
const requireFamilyAccess = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    
    if (!user || !user.family_id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'User must belong to a family'
      });
    }

    req.userFamilyId = user.family_id;
    next();
  } catch (error) {
    console.error('Family access check error:', error);
    res.status(500).json({
      error: 'Failed to verify family access',
      message: error.message
    });
  }
};

module.exports = {
  requireRole,
  requireParent,
  requireTeen,
  requireFamilyAccess
};

