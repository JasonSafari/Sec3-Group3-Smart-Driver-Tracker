const { validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const User = require('../models/User');
// Associations are set up in models/associations.js

/**
 * Get all trips for the authenticated user
 * GET /api/trips
 */
const getTrips = async (req, res) => {
  try {
    const userId = req.user.userId;

    const trips = await Trip.findAll({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'name', 'email', 'role']
      }],
      order: [['start_time', 'DESC']]
    });

    res.status(200).json({
      message: 'Trips retrieved successfully',
      trips
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      error: 'Failed to retrieve trips',
      message: error.message
    });
  }
};

/**
 * Get a single trip by ID
 * GET /api/trips/:id
 */
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const trip = await Trip.findOne({
      where: {
        trip_id: id,
        user_id: userId
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'name', 'email', 'role']
      }]
    });

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found'
      });
    }

    res.status(200).json({
      message: 'Trip retrieved successfully',
      trip
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({
      error: 'Failed to retrieve trip',
      message: error.message
    });
  }
};

/**
 * Create a new trip
 * POST /api/trips
 */
const createTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { start_time, end_time, distance_km, avg_speed, score_id } = req.body;

    const trip = await Trip.create({
      user_id: userId,
      start_time: start_time || new Date(),
      end_time,
      distance_km,
      avg_speed,
      score_id
    });

    res.status(201).json({
      message: 'Trip created successfully',
      trip
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({
      error: 'Failed to create trip',
      message: error.message
    });
  }
};

/**
 * Update a trip
 * PUT /api/trips/:id
 */
const updateTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const { start_time, end_time, distance_km, avg_speed, score_id } = req.body;

    const trip = await Trip.findOne({
      where: {
        trip_id: id,
        user_id: userId
      }
    });

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found'
      });
    }

    // Update only provided fields
    if (start_time !== undefined) trip.start_time = start_time;
    if (end_time !== undefined) trip.end_time = end_time;
    if (distance_km !== undefined) trip.distance_km = distance_km;
    if (avg_speed !== undefined) trip.avg_speed = avg_speed;
    if (score_id !== undefined) trip.score_id = score_id;

    await trip.save();

    res.status(200).json({
      message: 'Trip updated successfully',
      trip
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({
      error: 'Failed to update trip',
      message: error.message
    });
  }
};

/**
 * Delete a trip
 * DELETE /api/trips/:id
 */
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const trip = await Trip.findOne({
      where: {
        trip_id: id,
        user_id: userId
      }
    });

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found'
      });
    }

    await trip.destroy();

    res.status(200).json({
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      error: 'Failed to delete trip',
      message: error.message
    });
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip
};

