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

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    : true,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const timeoutMiddleware = require('./middleware/timeout');
app.use(timeoutMiddleware);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

require('./models/index');
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const familyRoutes = require('./routes/families');
const scoreRoutes = require('./routes/scores');
const dataPointRoutes = require('./routes/datapoints');
const analyticsRoutes = require('./routes/analytics');
const routeAnalysisRoutes = require('./routes/routes');

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/datapoints', dataPointRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/routes', routeAnalysisRoutes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();