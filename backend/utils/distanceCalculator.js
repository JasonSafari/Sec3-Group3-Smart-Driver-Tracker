/**
 * Distance Calculator Utility
 * Uses Haversine formula to calculate distance between two GPS coordinates
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Earth's radius in kilometers
  const R = 6371;

  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(2));
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate cumulative distance from all GPS points in a trip
 * This gives the actual distance traveled, not just straight-line distance
 * @param {Array} datapoints - Array of datapoint objects with latitude and longitude
 * @returns {number} Total distance in kilometers
 */
function calculateCumulativeDistance(datapoints) {
  if (!datapoints || datapoints.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  // Calculate distance between consecutive points
  for (let i = 1; i < datapoints.length; i++) {
    const prev = datapoints[i - 1];
    const curr = datapoints[i];

    // Skip if coordinates are missing
    if (
      !prev.latitude || !prev.longitude ||
      !curr.latitude || !curr.longitude
    ) {
      continue;
    }

    const segmentDistance = calculateDistance(
      parseFloat(prev.latitude),
      parseFloat(prev.longitude),
      parseFloat(curr.latitude),
      parseFloat(curr.longitude)
    );

    totalDistance += segmentDistance;
  }

  return parseFloat(totalDistance.toFixed(2));
}

module.exports = {
  calculateDistance,
  calculateCumulativeDistance
};

