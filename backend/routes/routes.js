const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getRouteHeatMap,
  getRouteAnalysis
} = require('../controllers/routeAnalysisController');

// All route analysis routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/routes/heatmap/:tripId
 * @desc    Get route heat map data for a trip
 * @access  Private
 */
router.get('/heatmap/:tripId', getRouteHeatMap);

/**
 * @route   GET /api/routes/analysis/:tripId
 * @desc    Get detailed route analysis for a trip
 * @access  Private
 */
router.get('/analysis/:tripId', getRouteAnalysis);

module.exports = router;

