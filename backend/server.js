require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Database connection
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Driver Analytics API is running',
    timestamp: new Date().toISOString()
  });
});

// Load model associations
require('./models/associations');

// Routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const tripRoutes = require('./routes/trips');
const familyRoutes = require('./routes/families');
const scoreRoutes = require('./routes/scores');
const dataPointRoutes = require('./routes/datapoints');
const analyticsRoutes = require('./routes/analytics');
const routeAnalysisRoutes = require('./routes/routes');

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/datapoints', dataPointRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/routes', routeAnalysisRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API Base: http://localhost:${PORT}/api`);
});