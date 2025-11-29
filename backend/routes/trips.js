const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  exportTripsToCSV,
  getFamilyTrips,
  searchTrips
} = require('../controllers/tripController');

// All trip routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/trips
 * @desc    Get all trips for authenticated user
 * @access  Private
 */
router.get('/', getTrips);

/**
 * @route   GET /api/trips/:id
 * @desc    Get a single trip by ID
 * @access  Private
 */
router.get('/:id', getTripById);

/**
 * @route   POST /api/trips
 * @desc    Create a new trip
 * @access  Private
 */
router.post('/', [
  body('start_time')
    .optional()
    .isISO8601().withMessage('Start time must be a valid date'),
  body('end_time')
    .optional()
    .isISO8601().withMessage('End time must be a valid date'),
  body('distance_km')
    .optional()
    .isFloat({ min: 0 }).withMessage('Distance must be a positive number'),
  body('avg_speed')
    .optional()
    .isFloat({ min: 0 }).withMessage('Average speed must be a positive number'),
  body('score_id')
    .optional()
    .isInt().withMessage('Score ID must be an integer')
], createTrip);

/**
 * @route   PUT /api/trips/:id
 * @desc    Update a trip
 * @access  Private
 */
router.put('/:id', [
  body('start_time')
    .optional()
    .isISO8601().withMessage('Start time must be a valid date'),
  body('end_time')
    .optional()
    .isISO8601().withMessage('End time must be a valid date'),
  body('distance_km')
    .optional()
    .isFloat({ min: 0 }).withMessage('Distance must be a positive number'),
  body('avg_speed')
    .optional()
    .isFloat({ min: 0 }).withMessage('Average speed must be a positive number'),
  body('score_id')
    .optional()
    .isInt().withMessage('Score ID must be an integer')
], updateTrip);

/**
 * @route   DELETE /api/trips/:id
 * @desc    Delete a trip
 * @access  Private
 */
router.delete('/:id', deleteTrip);

/**
 * @route   GET /api/trips/export/csv
 * @desc    Export trips to CSV format
 * @access  Private
 */
router.get('/export/csv', exportTripsToCSV);

/**
 * @route   GET /api/trips/family
 * @desc    Get all trips for family members
 * @access  Private
 */
router.get('/family', getFamilyTrips);

/**
 * @route   GET /api/trips/search
 * @desc    Search trips by keyword
 * @access  Private
 */
router.get('/search', searchTrips);

module.exports = router;

