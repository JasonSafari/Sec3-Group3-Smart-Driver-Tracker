const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Score = require('../models/Score');
const DataPoint = require('../models/DataPoint');

const getTrips = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const currentUser = await User.findByPk(currentUserId);
    const {
      userId: queryUserId,
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

    // Determine which user's trips to fetch
    let targetUserId = currentUserId;
    
    if (queryUserId && parseInt(queryUserId) !== currentUserId) {
      // Parent viewing teen's trips
      if (currentUser.role !== 'parent') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only parents can view other users\' trips'
        });
      }

      // Verify target user is in same family
      const targetUser = await User.findByPk(queryUserId);
      if (!targetUser || targetUser.family_id !== currentUser.family_id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Can only view trips from family members'
        });
      }

      targetUserId = parseInt(queryUserId);
    }

    // Build where clause
    const whereClause = { user_id: targetUserId };

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
    const tripId = parseInt(id);
    
    if (isNaN(tripId)) {
      return res.status(400).json({
        error: 'Invalid trip ID',
        message: 'Trip ID must be a valid number'
      });
    }

    const userId = req.user.userId;
    const currentUser = await User.findByPk(userId);

    if (!currentUser) {
      return res.status(401).json({
        error: 'User not found',
        message: 'Authentication error'
      });
    }

    // Find the trip
    const trip = await Trip.findOne({
      where: { trip_id: tripId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'family_id']
      }]
    });

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found',
        message: 'The specified trip does not exist'
      });
    }

    const isOwner = trip.user_id === userId;
    const isParentViewingFamilyTrip = 
      currentUser.role === 'parent' && 
      trip.user?.family_id && 
      trip.user.family_id === currentUser.family_id;

    if (!isOwner && !isParentViewingFamilyTrip) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own trips or trips from your family members'
      });
    }

    await DataPoint.destroy({
      where: { trip_id: tripId }
    });

    // Delete the trip
    await trip.destroy();

    res.status(200).json({
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to delete trip',
      message: error.message || 'An unexpected error occurred while deleting the trip'
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

    // Helper function to escape CSV values (prevents CSV injection)
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Escape quotes by doubling them
      const escaped = str.replace(/"/g, '""');
      // Wrap in quotes if contains comma, newline, or quote
      if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
        return `"${escaped}"`;
      }
      // Prevent CSV injection by prefixing dangerous characters with tab
      // Dangerous: =, +, -, @, \t
      if (/^[=+\-@\t]/.test(escaped)) {
        return `\t${escaped}`;
      }
      return escaped;
    };

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

      return [
        trip.trip_id,
        escapeCSV(trip.user?.name || ''),
        escapeCSV(trip.user?.email || ''),
        escapeCSV(startTime),
        escapeCSV(endTime),
        escapeCSV(distance),
        escapeCSV(avgSpeed),
        escapeCSV(overallScore),
        escapeCSV(speedScore),
        escapeCSV(brakeScore)
      ].join(',');
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

/**
 * Start a new trip
 * POST /api/trips/start
 */
const startTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const userId = req.user.userId;
    const { start_latitude, start_longitude, weather_condition } = req.body;

    // Validate coordinates
    const { isValidLatitude, isValidLongitude } = require('../utils/validators');
    if (!isValidLatitude(start_latitude) || !isValidLongitude(start_longitude)) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    // Create trip with start time and coordinates
    // Note: Database schema doesn't have start_latitude/start_longitude fields
    // We'll store them in the first datapoint instead
    const trip = await Trip.create({
      user_id: userId,
      start_time: new Date(),
      end_time: null,
      distance_km: null,
      avg_speed: null,
      score_id: null
    });

    // Create initial datapoint with start coordinates
    if (start_latitude && start_longitude) {
      await DataPoint.create({
        trip_id: trip.trip_id,
        timestamp: new Date(),
        latitude: start_latitude,
        longitude: start_longitude,
        speed: 0,
        acceleration: 0
      });
    }

    res.status(201).json({
      message: 'Trip started successfully',
      trip: {
        trip_id: trip.trip_id,
        user_id: trip.user_id,
        start_time: trip.start_time,
        start_latitude,
        start_longitude,
        weather_condition
      }
    });
  } catch (error) {
    console.error('Start trip error:', error);
    res.status(500).json({
      error: 'Failed to start trip',
      message: error.message
    });
  }
};

/**
 * Upload data points for a trip
 * POST /api/trips/:trip_id/datapoints
 */
const uploadDataPoints = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { trip_id } = req.params;
    const userId = req.user.userId;
    const { datapoints } = req.body;

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

    // Check if trip is still in progress (end_time is null)
    if (trip.end_time) {
      return res.status(400).json({
        error: 'Trip already completed',
        message: 'Cannot add data points to a completed trip'
      });
    }

    // Validate and prepare data points
    const { isValidLatitude, isValidLongitude } = require('../utils/validators');
    const dataPointsToCreate = datapoints.map(dp => {
      if (dp.latitude && !isValidLatitude(dp.latitude)) {
        throw new Error(`Invalid latitude: ${dp.latitude}`);
      }
      if (dp.longitude && !isValidLongitude(dp.longitude)) {
        throw new Error(`Invalid longitude: ${dp.longitude}`);
      }

      return {
        trip_id: parseInt(trip_id),
        timestamp: dp.timestamp ? new Date(dp.timestamp) : new Date(),
        latitude: dp.latitude,
        longitude: dp.longitude,
        speed: dp.speed,
        acceleration: dp.acceleration
      };
    });

    // Bulk create data points
    const createdDataPoints = await DataPoint.bulkCreate(dataPointsToCreate);

    res.status(201).json({
      message: 'Data points uploaded successfully',
      count: createdDataPoints.length,
      trip_id: parseInt(trip_id)
    });
  } catch (error) {
    console.error('Upload data points error:', error);
    res.status(500).json({
      error: 'Failed to upload data points',
      message: error.message
    });
  }
};

/**
 * Stop a trip and calculate score
 * POST /api/trips/:trip_id/stop
 */
const stopTrip = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { trip_id } = req.params;
    const userId = req.user.userId;
    const { end_latitude, end_longitude } = req.body;

    // Validate coordinates if provided
    if (end_latitude !== undefined || end_longitude !== undefined) {
      const { isValidLatitude, isValidLongitude } = require('../utils/validators');
      if (end_latitude !== undefined && !isValidLatitude(end_latitude)) {
        return res.status(400).json({
          error: 'Invalid end latitude'
        });
      }
      if (end_longitude !== undefined && !isValidLongitude(end_longitude)) {
        return res.status(400).json({
          error: 'Invalid end longitude'
        });
      }
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

    // Check if trip is already completed
    if (trip.end_time) {
      return res.status(400).json({
        error: 'Trip already completed',
        message: 'This trip has already been stopped'
      });
    }

    // Get all data points for this trip
    let datapoints = await DataPoint.findAll({
      where: { trip_id },
      order: [['timestamp', 'ASC']]
    });

    if (datapoints.length === 0) {
      return res.status(400).json({
        error: 'No data points',
        message: 'Cannot stop trip without data points'
      });
    }

    // Add end datapoint if coordinates provided (before calculating distance)
    if (end_latitude && end_longitude) {
      await DataPoint.create({
        trip_id: parseInt(trip_id),
        timestamp: new Date(),
        latitude: end_latitude,
        longitude: end_longitude,
        speed: 0,
        acceleration: 0
      });
      
      // Reload datapoints to include the end point
      datapoints = await DataPoint.findAll({
        where: { trip_id },
        order: [['timestamp', 'ASC']]
      });
    }

    // Calculate cumulative distance from all GPS points
    // This gives actual distance traveled, not just straight-line distance
    const { calculateCumulativeDistance } = require('../utils/distanceCalculator');
    let distance_km = 0;
    
    if (datapoints.length > 1) {
      distance_km = calculateCumulativeDistance(datapoints);
    }

    // Calculate average speed
    let totalSpeed = 0;
    let speedCount = 0;
    datapoints.forEach(dp => {
      if (dp.speed) {
        totalSpeed += parseFloat(dp.speed);
        speedCount++;
      }
    });
    const avg_speed = speedCount > 0 ? totalSpeed / speedCount : 0;

    // Calculate score using scoring service
    const { calculateScore } = require('../services/scoringService');
    const scoreData = calculateScore(datapoints);

    // Create score record
    const score = await Score.create({
      overall_score: scoreData.overall_score,
      speed_score: scoreData.speed_score,
      brake_score: scoreData.brake_score
    });

    // Update trip
    trip.end_time = new Date();
    trip.distance_km = distance_km;
    trip.avg_speed = avg_speed;
    trip.score_id = score.score_id;
    await trip.save();

    res.status(200).json({
      message: 'Trip stopped successfully',
      trip: {
        trip_id: trip.trip_id,
        user_id: trip.user_id,
        start_time: trip.start_time,
        end_time: trip.end_time,
        distance_km: trip.distance_km,
        avg_speed: trip.avg_speed,
        score_id: trip.score_id
      },
      score: {
        score_id: score.score_id,
        overall_score: score.overall_score,
        speed_score: score.speed_score,
        brake_score: score.brake_score,
        speeding_events: scoreData.speeding_events,
        harsh_brakes: scoreData.harsh_brakes
      }
    });
  } catch (error) {
    console.error('Stop trip error:', error);
    res.status(500).json({
      error: 'Failed to stop trip',
      message: error.message
    });
  }
};

/**
 * Get user trips with optional userId parameter (for parents viewing teens)
 * GET /api/trips?userId=...
 */
const getUserTrips = async (req, res) => {
  try {
    const { userId: queryUserId, limit = 20, offset = 0 } = req.query;
    const currentUserId = req.user.userId;
    const currentUser = await User.findByPk(currentUserId);

    // Determine which user's trips to fetch
    let targetUserId = currentUserId;
    
    if (queryUserId && parseInt(queryUserId) !== currentUserId) {
      // Parent viewing teen's trips
      if (currentUser.role !== 'parent') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only parents can view other users\' trips'
        });
      }

      // Verify target user is in same family
      const targetUser = await User.findByPk(queryUserId);
      if (!targetUser || targetUser.family_id !== currentUser.family_id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Can only view trips from family members'
        });
      }

      targetUserId = parseInt(queryUserId);
    }

    // Get trips
    const trips = await Trip.findAll({
      where: { user_id: targetUserId },
      include: [{
        model: Score,
        as: 'score',
        required: false
      }],
      order: [['start_time', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Trip.count({ where: { user_id: targetUserId } });
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      message: 'Trips retrieved successfully',
      trips,
      total,
      page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
      totalPages,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get user trips error:', error);
    res.status(500).json({
      error: 'Failed to retrieve trips',
      message: error.message
    });
  }
};

/**
 * Get trip details with datapoints
 * GET /api/trips/:trip_id
 */
const getTripDetails = async (req, res) => {
  try {
    const { trip_id } = req.params;
    const currentUserId = req.user.userId;
    const currentUser = await User.findByPk(currentUserId);

    // Get trip
    const trip = await Trip.findByPk(trip_id, {
      include: [{
        model: Score,
        as: 'score',
        required: false
      }]
    });

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found'
      });
    }

    // Verify permission (same user OR parent viewing teen in same family)
    if (trip.user_id !== currentUserId) {
      if (currentUser.role !== 'parent') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only view your own trips'
        });
      }

      const tripOwner = await User.findByPk(trip.user_id);
      if (!tripOwner || tripOwner.family_id !== currentUser.family_id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Can only view trips from family members'
        });
      }
    }

    // Get datapoints
    const datapoints = await DataPoint.findAll({
      where: { trip_id },
      order: [['timestamp', 'ASC']]
    });

    res.status(200).json({
      message: 'Trip details retrieved successfully',
      trip,
      datapoints,
      score: trip.score
    });
  } catch (error) {
    console.error('Get trip details error:', error);
    res.status(500).json({
      error: 'Failed to retrieve trip details',
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
  searchTrips,
  startTrip,
  uploadDataPoints,
  stopTrip,
  getUserTrips,
  getTripDetails
};

