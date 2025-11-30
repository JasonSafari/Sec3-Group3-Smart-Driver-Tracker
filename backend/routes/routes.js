const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getRouteHeatMap,
  getRouteAnalysis
} = require('../controllers/routeAnalysisController');

router.use(authenticateToken);

router.get('/heatmap/:tripId', getRouteHeatMap);
router.get('/analysis/:tripId', getRouteAnalysis);

module.exports = router;

