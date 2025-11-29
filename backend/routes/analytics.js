const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getTripSummary,
  getPerformanceTrends,
  getSafetyMetrics,
  getFamilyAnalytics,
  getUserStatistics,
  getScoreHistoryData
} = require('../controllers/analyticsController');

// All analytics routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/analytics/trips/summary
 * @desc    Get trip summary statistics for authenticated user
 * @access  Private
 */
router.get('/trips/summary', getTripSummary);

/**
 * @route   GET /api/analytics/performance/trends
 * @desc    Get performance trends over time
 * @access  Private
 * @query   days - Number of days to look back (default: 30)
 */
router.get('/performance/trends', getPerformanceTrends);

/**
 * @route   GET /api/analytics/safety
 * @desc    Get safety metrics
 * @access  Private
 */
router.get('/safety', getSafetyMetrics);

/**
 * @route   GET /api/analytics/family
 * @desc    Get family analytics (for parents)
 * @access  Private
 */
router.get('/family', getFamilyAnalytics);

/**
 * @route   GET /api/analytics/user/:userId?
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/user/:userId?', getUserStatistics);

/**
 * @route   GET /api/analytics/scores/:userId
 * @desc    Get score history for a user
 * @access  Private
 * @query   startDate?, endDate?
 */
router.get('/scores/:userId', getScoreHistoryData);

module.exports = router;

