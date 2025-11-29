const Trip = require('../models/Trip');
const User = require('../models/User');
const Score = require('../models/Score');
const DataPoint = require('../models/DataPoint');
const { Op } = require('sequelize');

/**
 * Get comprehensive statistics for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
async function getUserStats(userId) {
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

  if (trips.length === 0) {
    return {
      totalTrips: 0,
      totalDistance: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      totalSpeedingEvents: 0,
      totalHarshBrakes: 0,
      scoresByWeek: [],
      recentTrend: null
    };
  }

  // Calculate basic stats
  const totalTrips = trips.length;
  let totalDistance = 0;
  let totalScore = 0;
  let scoreCount = 0;
  let bestScore = 0;
  let worstScore = 100;
  let totalSpeedingEvents = 0;
  let totalHarshBrakes = 0;

  trips.forEach(trip => {
    if (trip.distance_km) {
      totalDistance += parseFloat(trip.distance_km);
    }
    if (trip.score) {
      const overallScore = parseFloat(trip.score.overall_score || 0);
      totalScore += overallScore;
      scoreCount++;
      if (overallScore > bestScore) bestScore = overallScore;
      if (overallScore < worstScore) worstScore = overallScore;
    }
  });

  const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;

  // Get speeding events and harsh brakes from scores
  // Note: These would ideally come from the scoring service, but we'll calculate from trips
  const tripsWithScores = trips.filter(t => t.score);
  // This is a simplified calculation - in reality, you'd need to recalculate from datapoints
  // For now, we'll estimate based on score differences
  tripsWithScores.forEach(trip => {
    if (trip.score) {
      // Estimate violations based on score (lower score = more violations)
      const score = parseFloat(trip.score.overall_score || 0);
      if (score < 80) {
        totalSpeedingEvents += Math.ceil((100 - score) / 10);
      }
      if (score < 70) {
        totalHarshBrakes += Math.ceil((100 - score) / 15);
      }
    }
  });

  // Group scores by week
  const scoresByWeek = {};
  trips.forEach(trip => {
    if (trip.start_time && trip.score) {
      const date = new Date(trip.start_time);
      const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
      if (!scoresByWeek[weekKey]) {
        scoresByWeek[weekKey] = { week: weekKey, scores: [], average: 0 };
      }
      scoresByWeek[weekKey].scores.push(parseFloat(trip.score.overall_score || 0));
    }
  });

  // Calculate weekly averages
  Object.keys(scoresByWeek).forEach(week => {
    const weekData = scoresByWeek[week];
    const sum = weekData.scores.reduce((a, b) => a + b, 0);
    weekData.average = parseFloat((sum / weekData.scores.length).toFixed(2));
  });

  // Recent trend: compare last 5 trips to previous 5
  let recentTrend = null;
  if (trips.length >= 10) {
    const last5 = trips.slice(0, 5);
    const previous5 = trips.slice(5, 10);
    
    const last5Avg = last5
      .filter(t => t.score)
      .reduce((sum, t) => sum + parseFloat(t.score.overall_score || 0), 0) / 
      last5.filter(t => t.score).length;
    
    const previous5Avg = previous5
      .filter(t => t.score)
      .reduce((sum, t) => sum + parseFloat(t.score.overall_score || 0), 0) / 
      previous5.filter(t => t.score).length;

    recentTrend = {
      direction: last5Avg > previous5Avg ? 'improving' : last5Avg < previous5Avg ? 'declining' : 'stable',
      change: parseFloat((last5Avg - previous5Avg).toFixed(2))
    };
  }

  return {
    totalTrips,
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    averageScore: parseFloat(averageScore.toFixed(2)),
    bestScore: parseFloat(bestScore.toFixed(2)),
    worstScore: parseFloat(worstScore.toFixed(2)),
    totalSpeedingEvents,
    totalHarshBrakes,
    scoresByWeek: Object.values(scoresByWeek),
    recentTrend
  };
}

/**
 * Get week number from date
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get score history for a user
 * @param {number} userId - User ID
 * @param {Date} startDate - Optional start date filter
 * @param {Date} endDate - Optional end date filter
 * @returns {Promise<Object>} Score history
 */
async function getScoreHistory(userId, startDate = null, endDate = null) {
  const whereClause = { user_id: userId };
  
  if (startDate || endDate) {
    whereClause.start_time = {};
    if (startDate) whereClause.start_time[Op.gte] = startDate;
    if (endDate) whereClause.start_time[Op.lte] = endDate;
  }

  const trips = await Trip.findAll({
    where: whereClause,
    include: [{
      model: Score,
      as: 'score',
      required: true
    }],
    order: [['start_time', 'ASC']]
  });

  const scores = trips
    .filter(trip => trip.score && trip.start_time)
    .map(trip => ({
      date: new Date(trip.start_time).toISOString().split('T')[0],
      overall_score: parseFloat(trip.score.overall_score || 0),
      speed_score: parseFloat(trip.score.speed_score || 0),
      brake_score: parseFloat(trip.score.brake_score || 0)
    }));

  return { scores };
}

/**
 * Get family statistics
 * @param {number} familyId - Family ID
 * @returns {Promise<Object>} Family statistics
 */
async function getFamilyStats(familyId) {
  // Get all users in family
  const users = await User.findAll({
    where: { family_id: familyId }
  });

  if (users.length === 0) {
    return {
      family: null,
      teenStats: []
    };
  }

  // Get family account
  const FamilyAccount = require('../models/FamilyAccount');
  const family = await FamilyAccount.findByPk(familyId);

  // Get stats for each teen
  const teenStats = [];
  for (const user of users) {
    if (user.role === 'teen') {
      const stats = await getUserStats(user.user_id);
      teenStats.push({
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        ...stats
      });
    }
  }

  return {
    family: family ? {
      family_id: family.family_id,
      family_name: family.family_name
    } : null,
    teenStats
  };
}

module.exports = {
  getUserStats,
  getScoreHistory,
  getFamilyStats
};

