const Trip = require('../models/Trip');
const DataPoint = require('../models/DataPoint');
const User = require('../models/User');
const { Op } = require('sequelize');

/**
 * Get route heat map data for a trip
 * GET /api/routes/heatmap/:tripId
 */
const getRouteHeatMap = async (req, res) => {
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

    // Get all data points for the trip
    const dataPoints = await DataPoint.findAll({
      where: { trip_id: tripId },
      order: [['timestamp', 'ASC']],
      attributes: ['point_id', 'latitude', 'longitude', 'speed', 'acceleration', 'timestamp']
    });

    if (dataPoints.length === 0) {
      return res.status(404).json({
        error: 'No data points found',
        message: 'This trip has no GPS data points'
      });
    }

    // Calculate heat map data (group by speed ranges)
    const heatMapData = dataPoints.map(point => ({
      lat: parseFloat(point.latitude),
      lng: parseFloat(point.longitude),
      speed: parseFloat(point.speed || 0),
      intensity: calculateIntensity(point.speed, point.acceleration)
    }));

    // Calculate route statistics
    const routeStats = {
      total_points: dataPoints.length,
      avg_speed: calculateAverage(dataPoints.map(p => p.speed)),
      max_speed: Math.max(...dataPoints.map(p => parseFloat(p.speed || 0))),
      min_speed: Math.min(...dataPoints.map(p => parseFloat(p.speed || 0))),
      speeding_points: dataPoints.filter(p => p.speed > 50).length,
      harsh_braking_points: dataPoints.filter(p => p.acceleration < -2.5).length
    };

    res.status(200).json({
      message: 'Route heat map data retrieved successfully',
      trip_id: tripId,
      heat_map: heatMapData,
      statistics: routeStats
    });
  } catch (error) {
    console.error('Get route heat map error:', error);
    res.status(500).json({
      error: 'Failed to retrieve route heat map',
      message: error.message
    });
  }
};

/**
 * Calculate intensity for heat map (0-1 scale)
 */
const calculateIntensity = (speed, acceleration) => {
  let intensity = 0.5; // Base intensity

  // Increase intensity for high speed
  if (speed > 50) {
    intensity += 0.3;
  } else if (speed > 30) {
    intensity += 0.1;
  }

  // Increase intensity for harsh braking
  if (acceleration < -2.5) {
    intensity += 0.2;
  }

  return Math.min(1, Math.max(0, intensity));
};

/**
 * Calculate average of array
 */
const calculateAverage = (arr) => {
  const filtered = arr.filter(v => v != null && !isNaN(v));
  if (filtered.length === 0) return 0;
  return filtered.reduce((a, b) => a + parseFloat(b), 0) / filtered.length;
};

/**
 * Get route analysis with detailed metrics
 * GET /api/routes/analysis/:tripId
 */
const getRouteAnalysis = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.userId;

    // Verify trip belongs to user
    const trip = await Trip.findOne({
      where: {
        trip_id: tripId,
        user_id: userId
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });

    if (!trip) {
      return res.status(404).json({
        error: 'Trip not found'
      });
    }

    // Get all data points
    const dataPoints = await DataPoint.findAll({
      where: { trip_id: tripId },
      order: [['timestamp', 'ASC']]
    });

    if (dataPoints.length === 0) {
      return res.status(404).json({
        error: 'No data points found'
      });
    }

    // Calculate route metrics
    const totalDistance = calculateRouteDistance(dataPoints);
    const duration = calculateDuration(dataPoints);
    const speedSegments = analyzeSpeedSegments(dataPoints);
    const accelerationSegments = analyzeAccelerationSegments(dataPoints);
    const routeEfficiency = calculateRouteEfficiency(dataPoints);

    res.status(200).json({
      message: 'Route analysis retrieved successfully',
      trip_id: tripId,
      analysis: {
        total_distance_km: totalDistance,
        duration_minutes: duration,
        average_speed: calculateAverage(dataPoints.map(p => p.speed)),
        max_speed: Math.max(...dataPoints.map(p => parseFloat(p.speed || 0))),
        speed_segments: speedSegments,
        acceleration_segments: accelerationSegments,
        route_efficiency: routeEfficiency,
        total_data_points: dataPoints.length
      }
    });
  } catch (error) {
    console.error('Get route analysis error:', error);
    res.status(500).json({
      error: 'Failed to retrieve route analysis',
      message: error.message
    });
  }
};

/**
 * Calculate route distance using Haversine formula
 */
const calculateRouteDistance = (dataPoints) => {
  if (dataPoints.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < dataPoints.length; i++) {
    const prev = dataPoints[i - 1];
    const curr = dataPoints[i];
    
    if (prev.latitude && prev.longitude && curr.latitude && curr.longitude) {
      const distance = haversineDistance(
        parseFloat(prev.latitude),
        parseFloat(prev.longitude),
        parseFloat(curr.latitude),
        parseFloat(curr.longitude)
      );
      totalDistance += distance;
    }
  }

  return parseFloat(totalDistance.toFixed(2));
};

/**
 * Haversine distance formula (returns distance in km)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate trip duration in minutes
 */
const calculateDuration = (dataPoints) => {
  if (dataPoints.length < 2) return 0;
  
  const first = new Date(dataPoints[0].timestamp);
  const last = new Date(dataPoints[dataPoints.length - 1].timestamp);
  return Math.round((last - first) / (1000 * 60)); // Convert to minutes
};

/**
 * Analyze speed segments
 */
const analyzeSpeedSegments = (dataPoints) => {
  const segments = {
    low: 0,      // < 30 km/h
    medium: 0,  // 30-50 km/h
    high: 0,     // 50-80 km/h
    very_high: 0 // > 80 km/h
  };

  dataPoints.forEach(point => {
    const speed = parseFloat(point.speed || 0);
    if (speed < 30) segments.low++;
    else if (speed < 50) segments.medium++;
    else if (speed < 80) segments.high++;
    else segments.very_high++;
  });

  return segments;
};

/**
 * Analyze acceleration segments
 */
const analyzeAccelerationSegments = (dataPoints) => {
  const segments = {
    harsh_braking: 0,  // < -2.5 m/s²
    normal_braking: 0, // -2.5 to -0.5 m/s²
    cruising: 0,       // -0.5 to 0.5 m/s²
    accelerating: 0   // > 0.5 m/s²
  };

  dataPoints.forEach(point => {
    const accel = parseFloat(point.acceleration || 0);
    if (accel < -2.5) segments.harsh_braking++;
    else if (accel < -0.5) segments.normal_braking++;
    else if (accel <= 0.5) segments.cruising++;
    else segments.accelerating++;
  });

  return segments;
};

/**
 * Calculate route efficiency score (0-100)
 */
const calculateRouteEfficiency = (dataPoints) => {
  if (dataPoints.length === 0) return 0;

  let efficiency = 100;
  
  // Penalize for speeding
  const speedingCount = dataPoints.filter(p => p.speed > 50).length;
  efficiency -= (speedingCount / dataPoints.length) * 30;

  // Penalize for harsh braking
  const harshBrakingCount = dataPoints.filter(p => p.acceleration < -2.5).length;
  efficiency -= (harshBrakingCount / dataPoints.length) * 40;

  // Penalize for excessive acceleration
  const excessiveAccelCount = dataPoints.filter(p => p.acceleration > 3).length;
  efficiency -= (excessiveAccelCount / dataPoints.length) * 20;

  return Math.max(0, Math.min(100, Math.round(efficiency)));
};

module.exports = {
  getRouteHeatMap,
  getRouteAnalysis
};

