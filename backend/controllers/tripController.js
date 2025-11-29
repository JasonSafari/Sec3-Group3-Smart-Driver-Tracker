const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Score = require('../models/Score');
const DataPoint = require('../models/DataPoint');
// Associations are set up in models/associations.js

/**
 * Get all trips for the authenticated user with filtering
 * GET /api/trips?startDate=2024-01-01&endDate=2024-12-31&minDistance=10&maxDistance=100&minScore=80
 */
const getTrips = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      startDate,
      endDate,
      minDistance,
      maxDistance,
      minScore,
      maxScore,
      limit = 50,
      offset = 0,
      sortBy = 'start_time',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause
    const whereClause = { user_id: userId };

    // Date filtering
    if (startDate || endDate) {
      whereClause.start_time = {};
      if (startDate) {
        whereClause.start_time[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.start_time[Op.lte] = new Date(endDate);
      }
    }

    // Distance filtering
    if (minDistance || maxDistance) {
      whereClause.distance_km = {};
      if (minDistance) {
        whereClause.distance_km[Op.gte] = parseFloat(minDistance);
      }
      if (maxDistance) {
        whereClause.distance_km[Op.lte] = parseFloat(maxDistance);
      }
    }

    // Score filtering (requires join with Score)
    let scoreFilter = {};
    if (minScore || maxScore) {
      if (minScore) {
        scoreFilter.overall_score = { [Op.gte]: parseFloat(minScore) };
      }
      if (maxScore) {
        scoreFilter.overall_score = {
          ...scoreFilter.overall_score,
          [Op.lte]: parseFloat(maxScore)
        };
      }
    }

    const trips = await Trip.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'email', 'role']
        },
        {
          model: Score,
          as: 'score',
          required: false,
          where: Object.keys(scoreFilter).length > 0 ? scoreFilter : undefined
        }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get total count for pagination
    const totalCount = await Trip.count({ where: whereClause });

    res.status(200).json({
      message: 'Trips retrieved successfully',
      trips,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
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

/**
 * Export trips to CSV
 * GET /api/trips/export/csv
 */
const exportTripsToCSV = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    const whereClause = { user_id: userId };
    if (startDate || endDate) {
      whereClause.start_time = {};
      if (startDate) whereClause.start_time[Op.gte] = new Date(startDate);
      if (endDate) whereClause.start_time[Op.lte] = new Date(endDate);
    }

    const trips = await Trip.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: Score,
          as: 'score',
          required: false
        }
      ],
      order: [['start_time', 'DESC']]
    });

    // Generate CSV
    const csvHeader = 'Trip ID,User Name,Email,Start Time,End Time,Distance (km),Avg Speed (km/h),Overall Score,Speed Score,Brake Score\n';
    const csvRows = trips.map(trip => {
      const startTime = trip.start_time ? new Date(trip.start_time).toISOString() : '';
      const endTime = trip.end_time ? new Date(trip.end_time).toISOString() : '';
      const distance = trip.distance_km || '';
      const avgSpeed = trip.avg_speed || '';
      const overallScore = trip.score?.overall_score || '';
      const speedScore = trip.score?.speed_score || '';
      const brakeScore = trip.score?.brake_score || '';

      return `${trip.trip_id},"${trip.user?.name || ''}","${trip.user?.email || ''}",${startTime},${endTime},${distance},${avgSpeed},${overallScore},${speedScore},${brakeScore}`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="trips_export_${new Date().toISOString().split('T')[0]}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export trips error:', error);
    res.status(500).json({
      error: 'Failed to export trips',
      message: error.message
    });
  }
};

/**
 * Get family trips (for parents to view teen trips)
 * GET /api/trips/family
 */
const getFamilyTrips = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (!user.family_id) {
      return res.status(404).json({
        error: 'No family found',
        message: 'User does not belong to any family'
      });
    }

    // Get all family members
    const familyMembers = await User.findAll({
      where: { family_id: user.family_id },
      attributes: ['user_id', 'name', 'role']
    });

    // Get trips for all family members
    const trips = await Trip.findAll({
      where: {
        user_id: familyMembers.map(m => m.user_id)
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'email', 'role']
        },
        {
          model: Score,
          as: 'score',
          required: false
        }
      ],
      order: [['start_time', 'DESC']]
    });

    res.status(200).json({
      message: 'Family trips retrieved successfully',
      trips,
      family_members: familyMembers.length
    });
  } catch (error) {
    console.error('Get family trips error:', error);
    res.status(500).json({
      error: 'Failed to retrieve family trips',
      message: error.message
    });
  }
};

/**
 * Search trips by various criteria
 * GET /api/trips/search?q=keyword
 */
const searchTrips = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { q, startDate, endDate } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Search query required',
        message: 'Please provide a search query'
      });
    }

    const whereClause = { user_id: userId };

    // Date filtering
    if (startDate || endDate) {
      whereClause.start_time = {};
      if (startDate) whereClause.start_time[Op.gte] = new Date(startDate);
      if (endDate) whereClause.start_time[Op.lte] = new Date(endDate);
    }

    // Get trips and search in related data
    const trips = await Trip.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'email', 'role']
        },
        {
          model: Score,
          as: 'score',
          required: false
        }
      ],
      order: [['start_time', 'DESC']]
    });

    // Filter trips based on search query
    const searchTerm = q.toLowerCase();
    const filteredTrips = trips.filter(trip => {
      const userName = trip.user?.name?.toLowerCase() || '';
      const userEmail = trip.user?.email?.toLowerCase() || '';
      const tripId = trip.trip_id.toString();
      const distance = trip.distance_km?.toString() || '';
      const score = trip.score?.overall_score?.toString() || '';

      return userName.includes(searchTerm) ||
             userEmail.includes(searchTerm) ||
             tripId.includes(searchTerm) ||
             distance.includes(searchTerm) ||
             score.includes(searchTerm);
    });

    res.status(200).json({
      message: 'Search completed successfully',
      query: q,
      results: filteredTrips,
      count: filteredTrips.length
    });
  } catch (error) {
    console.error('Search trips error:', error);
    res.status(500).json({
      error: 'Failed to search trips',
      message: error.message
    });
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  exportTripsToCSV,
  getFamilyTrips,
  searchTrips
};

