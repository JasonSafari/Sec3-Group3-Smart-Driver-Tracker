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

router.use(authenticateToken);

router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/', [
  body('start_time').optional().isISO8601(),
  body('end_time').optional().isISO8601(),
  body('distance_km').optional().isFloat({ min: 0 }),
  body('avg_speed').optional().isFloat({ min: 0 }),
  body('score_id').optional().isInt()
], createTrip);

router.put('/:id', [
  body('start_time').optional().isISO8601(),
  body('end_time').optional().isISO8601(),
  body('distance_km').optional().isFloat({ min: 0 }),
  body('avg_speed').optional().isFloat({ min: 0 }),
  body('score_id').optional().isInt()
], updateTrip);

router.delete('/:id', deleteTrip);
router.get('/export/csv', exportTripsToCSV);
router.get('/family', getFamilyTrips);
router.get('/search', searchTrips);

router.post('/start', [
  body('start_latitude').notEmpty().isFloat({ min: -90, max: 90 }),
  body('start_longitude').notEmpty().isFloat({ min: -180, max: 180 }),
  body('weather_condition').optional().isString()
], startTrip);

router.post('/:trip_id/datapoints', [
  body('datapoints').isArray({ min: 1 }),
  body('datapoints.*.timestamp').optional().isISO8601(),
  body('datapoints.*.latitude').optional().isFloat({ min: -90, max: 90 }),
  body('datapoints.*.longitude').optional().isFloat({ min: -180, max: 180 }),
  body('datapoints.*.speed').optional().isFloat({ min: 0 }),
  body('datapoints.*.acceleration').optional().isFloat()
], uploadDataPoints);

router.post('/:trip_id/stop', [
  body('end_latitude').optional().isFloat({ min: -90, max: 90 }),
  body('end_longitude').optional().isFloat({ min: -180, max: 180 })
], stopTrip);

router.get('/user/:userId', getUserTrips);
router.get('/:trip_id/details', getTripDetails);

module.exports = router;

