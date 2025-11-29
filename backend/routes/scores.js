const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  createScore,
  calculateScoreFromTrip,
  getScore,
  getUserScores
} = require('../controllers/scoreController');

// All score routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/scores
 * @desc    Get all scores for authenticated user's trips
 * @access  Private
 */
router.get('/', getUserScores);

/**
 * @route   GET /api/scores/:id
 * @desc    Get score by ID
 * @access  Private
 */
router.get('/:id', getScore);

/**
 * @route   POST /api/scores
 * @desc    Create a new score manually
 * @access  Private
 */
router.post('/', [
  body('overall_score')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Overall score must be between 0 and 100'),
  body('speed_score')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Speed score must be between 0 and 100'),
  body('brake_score')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Brake score must be between 0 and 100'),
  body('trip_id')
    .optional()
    .isInt().withMessage('Trip ID must be an integer')
], createScore);

/**
 * @route   POST /api/scores/calculate/:tripId
 * @desc    Calculate and create score from trip data points
 * @access  Private
 */
router.post('/calculate/:tripId', calculateScoreFromTrip);

module.exports = router;

