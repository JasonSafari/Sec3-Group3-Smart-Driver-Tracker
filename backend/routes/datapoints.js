const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  createDataPoint,
  createDataPointsBatch,
  getDataPointsByTrip,
  getDataPoint,
  deleteDataPoint
} = require('../controllers/dataPointController');

// All data point routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/datapoints/trip/:tripId
 * @desc    Get all data points for a trip
 * @access  Private
 */
router.get('/trip/:tripId', getDataPointsByTrip);

/**
 * @route   GET /api/datapoints/:id
 * @desc    Get a single data point by ID
 * @access  Private
 */
router.get('/:id', getDataPoint);

/**
 * @route   POST /api/datapoints
 * @desc    Create a single data point
 * @access  Private
 */
router.post('/', [
  body('trip_id')
    .notEmpty().withMessage('Trip ID is required')
    .isInt().withMessage('Trip ID must be an integer'),
  body('timestamp')
    .optional()
    .isISO8601().withMessage('Timestamp must be a valid date'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('speed')
    .optional()
    .isFloat({ min: 0 }).withMessage('Speed must be a positive number'),
  body('acceleration')
    .optional()
    .isFloat().withMessage('Acceleration must be a number')
], createDataPoint);

/**
 * @route   POST /api/datapoints/batch
 * @desc    Create multiple data points (batch)
 * @access  Private
 */
router.post('/batch', [
  body('trip_id')
    .notEmpty().withMessage('Trip ID is required')
    .isInt().withMessage('Trip ID must be an integer'),
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
], createDataPointsBatch);

/**
 * @route   DELETE /api/datapoints/:id
 * @desc    Delete a data point
 * @access  Private
 */
router.delete('/:id', deleteDataPoint);

module.exports = router;

