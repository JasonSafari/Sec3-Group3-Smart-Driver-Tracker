const { validationResult } = require('express-validator');
const Score = require('../models/Score');
const Trip = require('../models/Trip');
const DataPoint = require('../models/DataPoint');

/**
 * Calculate driving scores based on trip data
 * @param {Array} datapoints - Array of data points from the trip
 * @returns {Object} - Object with overall_score, speed_score, brake_score
 */
const calculateScores = (datapoints) => {
  if (!datapoints || datapoints.length === 0) {
    return {
      overall_score: 0,
      speed_score: 0,
      brake_score: 0
    };
  }

  // Calculate speed score (penalize for speeding)
  // Assuming speed limit is 50 km/h (adjust as needed)
  const SPEED_LIMIT = 50;
  let speedViolations = 0;
  let totalSpeed = 0;

  datapoints.forEach(point => {
    if (point.speed) {
      totalSpeed += parseFloat(point.speed);
      if (point.speed > SPEED_LIMIT) {
        speedViolations++;
      }
    }
  });

  const avgSpeed = totalSpeed / datapoints.length;
  const speedViolationRate = speedViolations / datapoints.length;
  // Speed score: 100 - (violation rate * 50) - (excess speed penalty)
  const speedScore = Math.max(0, Math.min(100, 100 - (speedViolationRate * 50) - Math.max(0, (avgSpeed - SPEED_LIMIT) * 2)));

  // Calculate brake score (penalize for harsh braking)
  // Harsh braking: acceleration < -2.5 m/s²
  let harshBrakes = 0;
  datapoints.forEach(point => {
    if (point.acceleration && point.acceleration < -2.5) {
      harshBrakes++;
    }
  });

  const brakeViolationRate = harshBrakes / datapoints.length;
  // Brake score: 100 - (violation rate * 60)
  const brakeScore = Math.max(0, Math.min(100, 100 - (brakeViolationRate * 60)));

  // Overall score: weighted average (60% speed, 40% brake)
  const overallScore = (speedScore * 0.6) + (brakeScore * 0.4);

  return {
    overall_score: parseFloat(overallScore.toFixed(2)),
    speed_score: parseFloat(speedScore.toFixed(2)),
    brake_score: parseFloat(brakeScore.toFixed(2))
  };
};

/**
 * Create a new score
 * POST /api/scores
 */
const createScore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { overall_score, speed_score, brake_score, trip_id } = req.body;

    const score = await Score.create({
      overall_score,
      speed_score,
      brake_score
    });

    // If trip_id is provided, link the score to the trip
    if (trip_id) {
      const trip = await Trip.findByPk(trip_id);
      if (trip) {
        trip.score_id = score.score_id;
        await trip.save();
      }
    }

    res.status(201).json({
      message: 'Score created successfully',
      score
    });
  } catch (error) {
    console.error('Create score error:', error);
    res.status(500).json({
      error: 'Failed to create score',
      message: error.message
    });
  }
};

/**
 * Calculate and create score from trip data points
 * POST /api/scores/calculate/:tripId
 */
const calculateScoreFromTrip = async (req, res) => {
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
        error: 'Trip not found'
      });
    }

    // Get all data points for this trip
    const datapoints = await DataPoint.findAll({
      where: { trip_id: tripId },
      order: [['timestamp', 'ASC']]
    });

    // Calculate scores
    const scores = calculateScores(datapoints);

    // Create or update score
    let score;
    if (trip.score_id) {
      score = await Score.findByPk(trip.score_id);
      score.overall_score = scores.overall_score;
      score.speed_score = scores.speed_score;
      score.brake_score = scores.brake_score;
      await score.save();
    } else {
      score = await Score.create(scores);
      trip.score_id = score.score_id;
      await trip.save();
    }

    res.status(200).json({
      message: 'Score calculated successfully',
      score,
      trip_id: tripId
    });
  } catch (error) {
    console.error('Calculate score error:', error);
    res.status(500).json({
      error: 'Failed to calculate score',
      message: error.message
    });
  }
};

/**
 * Get score by ID
 * GET /api/scores/:id
 */
const getScore = async (req, res) => {
  try {
    const { id } = req.params;

    const score = await Score.findByPk(id, {
      include: [{
        model: Trip,
        as: 'trips',
        attributes: ['trip_id', 'user_id', 'start_time', 'end_time']
      }]
    });

    if (!score) {
      return res.status(404).json({
        error: 'Score not found'
      });
    }

    res.status(200).json({
      message: 'Score retrieved successfully',
      score
    });
  } catch (error) {
    console.error('Get score error:', error);
    res.status(500).json({
      error: 'Failed to retrieve score',
      message: error.message
    });
  }
};

/**
 * Get all scores for user's trips
 * GET /api/scores
 */
const getUserScores = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all trips for user
    const trips = await Trip.findAll({
      where: { user_id: userId },
      include: [{
        model: Score,
        as: 'score',
        required: false
      }],
      order: [['start_time', 'DESC']]
    });

    // Extract scores from trips
    const scores = trips
      .filter(trip => trip.score)
      .map(trip => ({
        ...trip.score.toJSON(),
        trip_id: trip.trip_id,
        trip_start_time: trip.start_time
      }));

    res.status(200).json({
      message: 'Scores retrieved successfully',
      scores,
      count: scores.length
    });
  } catch (error) {
    console.error('Get user scores error:', error);
    res.status(500).json({
      error: 'Failed to retrieve scores',
      message: error.message
    });
  }
};

module.exports = {
  createScore,
  calculateScoreFromTrip,
  getScore,
  getUserScores,
  calculateScores // Export for use in other controllers
};

