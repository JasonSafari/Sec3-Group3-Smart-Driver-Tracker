const { validationResult } = require('express-validator');
const DataPoint = require('../models/DataPoint');
const Trip = require('../models/Trip');

/**
 * Create a single data point
 * POST /api/datapoints
 */
const createDataPoint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { trip_id, timestamp, latitude, longitude, speed, acceleration } = req.body;
    const userId = req.user.userId;

    // Verify trip belongs to user
    const trip = await Trip.findOne({
      where: {
        trip_id,
        user_id: userId
      }
    });

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found',
        message: 'Trip does not exist or does not belong to you'
      });
    }

    const dataPoint = await DataPoint.create({
      trip_id,
      timestamp: timestamp || new Date(),
      latitude,
      longitude,
      speed,
      acceleration
    });

    res.status(201).json({
      message: 'Data point created successfully',
      dataPoint
    });
  } catch (error) {
    console.error('Create data point error:', error);
    res.status(500).json({
      error: 'Failed to create data point',
      message: error.message
    });
  }
};

/**
 * Create multiple data points (batch)
 * POST /api/datapoints/batch
 */
const createDataPointsBatch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { trip_id, datapoints } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(datapoints) || datapoints.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'datapoints must be a non-empty array'
      });
    }

    // Verify trip belongs to user
    const trip = await Trip.findOne({
      where: {
        trip_id,
        user_id: userId
      }
    });

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found',
        message: 'Trip does not exist or does not belong to you'
      });
    }

    // Prepare data points for bulk insert
    const dataPointsToCreate = datapoints.map(dp => ({
      trip_id,
      timestamp: dp.timestamp || new Date(),
      latitude: dp.latitude,
      longitude: dp.longitude,
      speed: dp.speed,
      acceleration: dp.acceleration
    }));

    // Bulk create
    const createdDataPoints = await DataPoint.bulkCreate(dataPointsToCreate);

    res.status(201).json({
      message: 'Data points created successfully',
      count: createdDataPoints.length,
      dataPoints: createdDataPoints
    });
  } catch (error) {
    console.error('Create data points batch error:', error);
    res.status(500).json({
      error: 'Failed to create data points',
      message: error.message
    });
  }
};

/**
 * Get all data points for a trip
 * GET /api/datapoints/trip/:tripId
 */
const getDataPointsByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId;

    // Verify trip belongs to user
    const trip = await Trip.findOne({
      where: {
        trip_id: tripId,
        user_id: userId
      }
    });

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found',
        message: 'Trip does not exist or does not belong to you'
      });
    }

    const dataPoints = await DataPoint.findAll({
      where: { trip_id: tripId },
      order: [['timestamp', 'ASC']]
    });

    res.status(200).json({
      message: 'Data points retrieved successfully',
      trip_id: tripId,
      count: dataPoints.length,
      dataPoints
    });
  } catch (error) {
    console.error('Get data points error:', error);
    res.status(500).json({
      error: 'Failed to retrieve data points',
      message: error.message
    });
  }
};

/**
 * Get a single data point by ID
 * GET /api/datapoints/:id
 */
const getDataPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const dataPoint = await DataPoint.findByPk(id, {
      include: [{
        model: Trip,
        as: 'trip',
        attributes: ['trip_id', 'user_id']
      }]
    });

    if (!dataPoint) {
      return res.status(404).json({
        error: 'Data point not found'
      });
    }

    // Verify trip belongs to user
    if (dataPoint.trip.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'This data point does not belong to you'
      });
    }

    res.status(200).json({
      message: 'Data point retrieved successfully',
      dataPoint
    });
  } catch (error) {
    console.error('Get data point error:', error);
    res.status(500).json({
      error: 'Failed to retrieve data point',
      message: error.message
    });
  }
};

/**
 * Delete a data point
 * DELETE /api/datapoints/:id
 */
const deleteDataPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const dataPoint = await DataPoint.findByPk(id, {
      include: [{
        model: Trip,
        as: 'trip',
        attributes: ['trip_id', 'user_id']
      }]
    });

    if (!dataPoint) {
      return res.status(404).json({
        error: 'Data point not found'
      });
    }

    // Verify trip belongs to user
    if (dataPoint.trip.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'This data point does not belong to you'
      });
    }

    await dataPoint.destroy();

    res.status(200).json({
      message: 'Data point deleted successfully'
    });
  } catch (error) {
    console.error('Delete data point error:', error);
    res.status(500).json({
      error: 'Failed to delete data point',
      message: error.message
    });
  }
};

module.exports = {
  createDataPoint,
  createDataPointsBatch,
  getDataPointsByTrip,
  getDataPoint,
  deleteDataPoint
};

