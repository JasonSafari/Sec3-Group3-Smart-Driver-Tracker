require('dotenv').config();

const { Sequelize } = require('sequelize');

// Create Sequelize instance for MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries during development
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true, // Use snake_case for auto-generated fields
      freezeTableName: true // Don't pluralize table names
    }
  }
);

// Test database connection - BLOCKS server startup if connection fails
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ CRITICAL: Unable to connect to MySQL database:', error.message);
    console.error('⚠️  Please check your .env file and ensure:');
    console.error('   - DB_NAME, DB_USER, DB_PASSWORD, DB_HOST are set correctly');
    console.error('   - MySQL server is running');
    console.error('   - User has proper permissions');
    // Exit process - server should not start without database
    process.exit(1);
  }
};

// Export sequelize and connection test function
module.exports = sequelize;
module.exports.testConnection = testConnection;

