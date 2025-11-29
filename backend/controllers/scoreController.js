const { validationResult } = require('express-validator');
const Score = require('../models/Score');
const Trip = require('../models/Trip');
const DataPoint = require('../models/DataPoint');

/**
 * Calculate driving scores based on trip data with customizable parameters
 * @param {Array} datapoints - Array of data points from the trip
 * @param {Object} params - Customizable scoring parameters
 * @returns {Object} - Object with overall_score, speed_score, brake_score
 */
const calculateScores = (datapoints, params = {}) => {
  if (!datapoints || datapoints.length === 0) {
    return {
      overall_score: 0,
      speed_score: 0,
      brake_score: 0
    };
  }

  // Customizable parameters with defaults
  const SPEED_LIMIT = params.speedLimit || 50;
  const HARSH_BRAKE_THRESHOLD = params.harshBrakeThreshold || -2.5;
  const SPEED_PENALTY_MULTIPLIER = params.speedPenaltyMultiplier || 50;
  const BRAKE_PENALTY_MULTIPLIER = params.brakePenaltyMultiplier || 60;
  const SPEED_WEIGHT = params.speedWeight || 0.6;
  const BRAKE_WEIGHT = params.brakeWeight || 0.4;

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
  // Speed score: 100 - (violation rate * penalty) - (excess speed penalty)
  const speedScore = Math.max(0, Math.min(100, 
    100 - (speedViolationRate * SPEED_PENALTY_MULTIPLIER) - 
    Math.max(0, (avgSpeed - SPEED_LIMIT) * 2)
  ));

  // Calculate brake score (penalize for harsh braking)
  let harshBrakes = 0;
  datapoints.forEach(point => {
    if (point.acceleration && point.acceleration < HARSH_BRAKE_THRESHOLD) {
      harshBrakes++;
    }
  });

  const brakeViolationRate = harshBrakes / datapoints.length;
  // Brake score: 100 - (violation rate * penalty)
  const brakeScore = Math.max(0, Math.min(100, 
    100 - (brakeViolationRate * BRAKE_PENALTY_MULTIPLIER)
  ));

  // Overall score: weighted average
  const overallScore = (speedScore * SPEED_WEIGHT) + (brakeScore * BRAKE_WEIGHT);

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
 * Calculate and create score from trip data points with customizable parameters
 * POST /api/scores/calculate/:tripId
 */
const calculateScoreFromTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId;
    const {
      speedLimit,
      harshBrakeThreshold,
      speedPenaltyMultiplier,
      brakePenaltyMultiplier,
      speedWeight,
      brakeWeight
    } = req.body;

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

    // Build custom parameters object
    const customParams = {};
    if (speedLimit !== undefined) customParams.speedLimit = parseFloat(speedLimit);
    if (harshBrakeThreshold !== undefined) customParams.harshBrakeThreshold = parseFloat(harshBrakeThreshold);
    if (speedPenaltyMultiplier !== undefined) customParams.speedPenaltyMultiplier = parseFloat(speedPenaltyMultiplier);
    if (brakePenaltyMultiplier !== undefined) customParams.brakePenaltyMultiplier = parseFloat(brakePenaltyMultiplier);
    if (speedWeight !== undefined) customParams.speedWeight = parseFloat(speedWeight);
    if (brakeWeight !== undefined) customParams.brakeWeight = parseFloat(brakeWeight);

    // Validate weights sum to 1.0
    if (customParams.speedWeight !== undefined || customParams.brakeWeight !== undefined) {
      const finalSpeedWeight = customParams.speedWeight || 0.6;
      const finalBrakeWeight = customParams.brakeWeight || 0.4;
      if (Math.abs((finalSpeedWeight + finalBrakeWeight) - 1.0) > 0.01) {
        return res.status(400).json({
          error: 'Invalid weights',
          message: 'speedWeight and brakeWeight must sum to 1.0'
        });
      }
    }

    // Calculate scores with custom parameters
    const scores = calculateScores(datapoints, customParams);

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
      trip_id: tripId,
      parameters_used: customParams
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

