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
  searchTrips,
  startTrip,
  uploadDataPoints,
  stopTrip,
  getUserTrips,
  getTripDetails
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

/**
 * @route   POST /api/trips/start
 * @desc    Start a new trip
 * @access  Private
 */
router.post('/start', [
  body('start_latitude')
    .notEmpty().withMessage('Start latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('start_longitude')
    .notEmpty().withMessage('Start longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('weather_condition')
    .optional()
    .isString().withMessage('Weather condition must be a string')
], startTrip);

/**
 * @route   POST /api/trips/:trip_id/datapoints
 * @desc    Upload data points for a trip
 * @access  Private
 */
router.post('/:trip_id/datapoints', [
  body('datapoints')
    .isArray({ min: 1 }).withMessage('datapoints must be a non-empty array'),
  body('datapoints.*.timestamp')
    .optional()
    .isISO8601().withMessage('Timestamp must be a valid date'),
  body('datapoints.*.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('datapoints.*.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('datapoints.*.speed')
    .optional()
    .isFloat({ min: 0 }).withMessage('Speed must be a positive number'),
  body('datapoints.*.acceleration')
    .optional()
    .isFloat().withMessage('Acceleration must be a number')
], uploadDataPoints);

/**
 * @route   POST /api/trips/:trip_id/stop
 * @desc    Stop a trip and calculate score
 * @access  Private
 */
router.post('/:trip_id/stop', [
  body('end_latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('end_longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
], stopTrip);

/**
 * @route   GET /api/trips
 * @desc    Get user trips (supports userId query param for parents)
 * @access  Private
 */
// Note: This route is already defined above, but we'll add getUserTrips as alternative
// The existing getTrips handles filtering, getUserTrips handles parent/teen viewing

module.exports = router;

