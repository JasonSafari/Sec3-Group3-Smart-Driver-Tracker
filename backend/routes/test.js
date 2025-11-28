const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/test/protected
 * @desc    Test protected route
 * @access  Private (requires token)
 */
router.get('/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Protected route accessed successfully',
    user: req.user
  });
});

module.exports = router;