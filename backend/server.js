require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Validate critical environment variables before starting
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET is not set in .env file');
  console.error('   Generate a secure secret: openssl rand -base64 32');
  process.exit(1);
}

if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST) {
  console.error('❌ CRITICAL: Database configuration missing in .env file');
  console.error('   Required: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST');
  process.exit(1);
}

// Database connection
const sequelize = require('./config/database');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - only allow specific origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    : true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request timeout middleware (prevents hanging requests)
const timeoutMiddleware = require('./middleware/timeout');
app.use(timeoutMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Driver Analytics API is running',
    timestamp: new Date().toISOString()
  });
});

// Load model associations
require('./models/index');

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

// Error handling middleware (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server only after database connection is established
const startServer = async () => {
  try {
    // Test database connection - blocks if connection fails
    await testConnection();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API Base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();