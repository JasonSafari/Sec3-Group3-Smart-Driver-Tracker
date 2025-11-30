const { Op } = require('sequelize');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Score = require('../models/Score');
const DataPoint = require('../models/DataPoint');
const { getUserStats, getScoreHistory, getFamilyStats } = require('../services/analyticsService');

/**
 * Get trip summary statistics for authenticated user
 * GET /api/analytics/trips/summary
 */
const getTripSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const trips = await Trip.findAll({
      where: { user_id: userId },
      include: [{
        model: Score,
        as: 'score',
        required: false
      }]
    });

    if (trips.length === 0) {
      return res.status(200).json({
        message: 'No trips found',
        summary: {
          total_trips: 0,
          total_distance: 0,
          total_duration: 0,
          average_speed: 0,
          average_score: 0
        }
      });
    }

    // Calculate statistics
    let totalDistance = 0;
    let totalDuration = 0;
    let totalSpeed = 0;
    let totalScore = 0;
    let scoredTrips = 0;

    trips.forEach(trip => {
      if (trip.distance_km) {
        totalDistance += parseFloat(trip.distance_km);
      }
      if (trip.start_time && trip.end_time) {
        const duration = new Date(trip.end_time) - new Date(trip.start_time);
        totalDuration += duration; // milliseconds
      }
      if (trip.avg_speed) {
        totalSpeed += parseFloat(trip.avg_speed);
      }
      if (trip.score && trip.score.overall_score) {
        totalScore += parseFloat(trip.score.overall_score);
        scoredTrips++;
      }
    });

    const averageSpeed = trips.length > 0 ? totalSpeed / trips.length : 0;
    const averageScore = scoredTrips > 0 ? totalScore / scoredTrips : 0;
    const totalDurationHours = totalDuration / (1000 * 60 * 60); // Convert to hours

    res.status(200).json({
      message: 'Trip summary retrieved successfully',
      summary: {
        total_trips: trips.length,
        total_distance_km: parseFloat(totalDistance.toFixed(2)),
        total_duration_hours: parseFloat(totalDurationHours.toFixed(2)),
        average_speed_kmh: parseFloat(averageSpeed.toFixed(2)),
        average_score: parseFloat(averageScore.toFixed(2)),
        trips_with_scores: scoredTrips
      }
    });
  } catch (error) {
    console.error('Get trip summary error:', error);
    res.status(500).json({
      error: 'Failed to retrieve trip summary',
      message: error.message
    });
  }
};

/**
 * Get performance trends over time
 * GET /api/analytics/performance/trends
 */
const getPerformanceTrends = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = 30 } = req.query; // Default to last 30 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trips = await Trip.findAll({
      where: {
        user_id: userId,
        start_time: {
          [Op.gte]: startDate
        }
      },
      include: [{
        model: Score,
        as: 'score',
        required: false
      }],
      order: [['start_time', 'ASC']]
    });

    // Group trips by date and calculate daily averages
    const trends = {};
    trips.forEach(trip => {
      if (trip.start_time && trip.score) {
        const date = new Date(trip.start_time).toISOString().split('T')[0];
        if (!trends[date]) {
          trends[date] = {
            date,
            trips: 0,
            total_score: 0,
            total_speed_score: 0,
            total_brake_score: 0,
            count: 0
          };
        }
        trends[date].trips++;
        trends[date].total_score += parseFloat(trip.score.overall_score || 0);
        trends[date].total_speed_score += parseFloat(trip.score.speed_score || 0);
        trends[date].total_brake_score += parseFloat(trip.score.brake_score || 0);
        trends[date].count++;
      }
    });

    // Calculate averages
    const trendData = Object.values(trends).map(trend => ({
      date: trend.date,
      trips: trend.trips,
      average_score: trend.count > 0 ? parseFloat((trend.total_score / trend.count).toFixed(2)) : 0,
      average_speed_score: trend.count > 0 ? parseFloat((trend.total_speed_score / trend.count).toFixed(2)) : 0,
      average_brake_score: trend.count > 0 ? parseFloat((trend.total_brake_score / trend.count).toFixed(2)) : 0
    }));

    res.status(200).json({
      message: 'Performance trends retrieved successfully',
      period_days: parseInt(days),
      trends: trendData
    });
  } catch (error) {
    console.error('Get performance trends error:', error);
    res.status(500).json({
      error: 'Failed to retrieve performance trends',
      message: error.message
    });
  }
};

/**
 * Get safety metrics
 * GET /api/analytics/safety
 */
const getSafetyMetrics = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Optimize query - use aggregation instead of loading all datapoints
    const trips = await Trip.findAll({
      where: { user_id: userId },
      attributes: ['trip_id'],
      include: [{
        model: DataPoint,
        as: 'datapoints',
        required: false,
        attributes: ['speed', 'acceleration']
      }]
    });

    let totalDataPoints = 0;
    let speedingInstances = 0;
    let harshBrakingInstances = 0;
    const SPEED_LIMIT = 50; // km/h

    // Process datapoints efficiently
    trips.forEach(trip => {
      if (trip.datapoints && trip.datapoints.length > 0) {
        trip.datapoints.forEach(point => {
          totalDataPoints++;
          if (point.speed && point.speed > SPEED_LIMIT) {
            speedingInstances++;
          }
          if (point.acceleration && point.acceleration < -2.5) {
            harshBrakingInstances++;
          }
        });
      }
    });

    const speedingRate = totalDataPoints > 0 ? (speedingInstances / totalDataPoints) * 100 : 0;
    const harshBrakingRate = totalDataPoints > 0 ? (harshBrakingInstances / totalDataPoints) * 100 : 0;

    res.status(200).json({
      message: 'Safety metrics retrieved successfully',
      metrics: {
        total_trips: trips.length,
        total_data_points: totalDataPoints,
        speeding_instances: speedingInstances,
        speeding_rate_percent: parseFloat(speedingRate.toFixed(2)),
        harsh_braking_instances: harshBrakingInstances,
        harsh_braking_rate_percent: parseFloat(harshBrakingRate.toFixed(2)),
        safety_score: parseFloat((100 - speedingRate - harshBrakingRate).toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get safety metrics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve safety metrics',
      message: error.message
    });
  }
};

/**
 * Get user statistics
 * GET /api/analytics/user/:userId?
 */
const getUserStatistics = async (req, res) => {
  try {
    const { userId: queryUserId } = req.params;
    const currentUserId = req.user.userId;
    const currentUser = await User.findByPk(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Current user not found in database'
      });
    }

    // Determine target user
    let targetUserId = currentUserId;
    
    if (queryUserId && parseInt(queryUserId) !== currentUserId) {
      // Parent viewing teen's stats
      if (currentUser.role !== 'parent') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only parents can view other users\' statistics'
        });
      }

      const targetUser = await User.findByPk(queryUserId);
      if (!targetUser || targetUser.family_id !== currentUser.family_id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Can only view statistics from family members'
        });
      }

      targetUserId = parseInt(queryUserId);
    }

    if (!targetUserId || isNaN(targetUserId)) {
      return res.status(400).json({
        error: 'Invalid user ID',
        message: 'User ID must be a valid number'
      });
    }

    const stats = await getUserStats(targetUserId);

    res.status(200).json({
      message: 'User statistics retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to retrieve user statistics',
      message: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get score history
 * GET /api/analytics/scores/:userId
 */
const getScoreHistoryData = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const currentUser = await User.findByPk(currentUserId);

    // Verify permission
    if (parseInt(userId) !== currentUserId) {
      if (currentUser.role !== 'parent') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only parents can view other users\' score history'
        });
      }

      const targetUser = await User.findByPk(userId);
      if (!targetUser || targetUser.family_id !== currentUser.family_id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Can only view score history from family members'
        });
      }
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const history = await getScoreHistory(parseInt(userId), start, end);

    res.status(200).json({
      message: 'Score history retrieved successfully',
      ...history
    });
  } catch (error) {
    console.error('Get score history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve score history',
      message: error.message
    });
  }
};

/**
 * Get family analytics (for parents)
 * GET /api/analytics/family
 */
const getFamilyAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (user.role !== 'parent') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only parents can view family analytics'
      });
    }

    if (!user.family_id) {
      return res.status(404).json({
        error: 'No family found',
        message: 'User does not belong to any family'
      });
    }

    const familyStats = await getFamilyStats(user.family_id);

    res.status(200).json({
      message: 'Family analytics retrieved successfully',
      ...familyStats
    });
  } catch (error) {
    console.error('Get family analytics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve family analytics',
      message: error.message
    });
  }
};

module.exports = {
  getTripSummary,
  getPerformanceTrends,
  getSafetyMetrics,
  getFamilyAnalytics,
  getUserStatistics,
  getScoreHistoryData
};

