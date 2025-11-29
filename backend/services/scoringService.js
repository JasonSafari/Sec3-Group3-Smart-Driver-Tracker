/**
 * Scoring Service
 * Calculates driving safety scores based on GPS and accelerometer data
 * 
 * Algorithm:
 * - Speed Score: Starts at 100, penalizes for speeding over 65 mph
 * - Brake Score: Starts at 100, penalizes for harsh braking
 * - Overall Score: Average of speed and brake scores
 */

/**
 * Calculate driving scores based on trip data points
 * @param {Array} datapoints - Array of data point objects with speed and acceleration
 * @returns {Object} Score object with overall_score, speed_score, brake_score, speeding_events, harsh_brakes
 */
function calculateScore(datapoints) {
  if (!datapoints || datapoints.length === 0) {
    return {
      overall_score: 0,
      speed_score: 0,
      brake_score: 0,
      speeding_events: 0,
      harsh_brakes: 0
    };
  }

  // Speed limit: 65 mph = 104.6 km/h
  const SPEED_LIMIT_MPH = 65;
  const SPEED_LIMIT_KMH = 104.6;

  // Speed Score calculation (starts at 100)
  let speedScore = 100;
  let speedingEvents = 0;

  datapoints.forEach(point => {
    if (point.speed) {
      const speed = parseFloat(point.speed);
      
      // Check if speed is in mph or km/h (assume km/h if > 50, otherwise mph)
      const speedMph = speed > 50 ? speed / 1.60934 : speed;
      
      if (speedMph > SPEED_LIMIT_MPH) {
        const overLimit = speedMph - SPEED_LIMIT_MPH;
        speedingEvents++;

        // Apply penalties based on how much over the limit
        if (overLimit >= 1 && overLimit <= 5) {
          speedScore -= 2;
        } else if (overLimit >= 6 && overLimit <= 10) {
          speedScore -= 5;
        } else if (overLimit >= 11) {
          speedScore -= 10;
        }
      }
    }
  });

  // Ensure speed score doesn't go below 0
  speedScore = Math.max(0, speedScore);

  // Brake Score calculation (starts at 100)
  let brakeScore = 100;
  let harshBrakes = 0;

  datapoints.forEach(point => {
    if (point.acceleration !== null && point.acceleration !== undefined) {
      const acceleration = parseFloat(point.acceleration);
      
      // Harsh braking: acceleration < -3 m/s²
      if (acceleration < -3) {
        if (acceleration >= -5) {
          // -3 to -5: -3 points
          brakeScore -= 3;
        } else if (acceleration >= -8) {
          // -5 to -8: -7 points, count as harsh brake
          brakeScore -= 7;
          harshBrakes++;
        } else {
          // -8 or worse: -15 points, count as harsh brake
          brakeScore -= 15;
          harshBrakes++;
        }
      }
    }
  });

  // Ensure brake score doesn't go below 0
  brakeScore = Math.max(0, brakeScore);

  // Overall Score: Average of speed and brake scores
  const overallScore = (speedScore + brakeScore) / 2;

  return {
    overall_score: parseFloat(overallScore.toFixed(2)),
    speed_score: parseFloat(speedScore.toFixed(2)),
    brake_score: parseFloat(brakeScore.toFixed(2)),
    speeding_events: speedingEvents,
    harsh_brakes: harshBrakes
  };
}

module.exports = {
  calculateScore
};

