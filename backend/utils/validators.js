/**
 * Validation Helper Functions
 * Reusable validation functions for common data types
 */

/**
 * Validate latitude value
 * @param {number} lat - Latitude to validate
 * @returns {boolean} True if valid (-90 to 90)
 */
function isValidLatitude(lat) {
  const latitude = parseFloat(lat);
  return !isNaN(latitude) && latitude >= -90 && latitude <= 90;
}

/**
 * Validate longitude value
 * @param {number} lon - Longitude to validate
 * @returns {boolean} True if valid (-180 to 180)
 */
function isValidLongitude(lon) {
  const longitude = parseFloat(lon);
  return !isNaN(longitude) && longitude >= -180 && longitude <= 180;
}

/**
 * Validate invite code format
 * @param {string} code - Invite code to validate
 * @returns {boolean} True if valid (6 alphanumeric characters)
 */
function isValidInviteCode(code) {
  if (typeof code !== 'string') return false;
  return /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Validate user role
 * @param {string} role - Role to validate
 * @returns {boolean} True if valid ('parent' or 'teen')
 */
function isValidRole(role) {
  return role === 'parent' || role === 'teen';
}

module.exports = {
  isValidLatitude,
  isValidLongitude,
  isValidInviteCode,
  isValidRole
};

