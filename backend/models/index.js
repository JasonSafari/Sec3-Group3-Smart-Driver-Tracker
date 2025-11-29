/**
 * Models Index
 * Centralized model exports and associations
 */

const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const FamilyAccount = require('./FamilyAccount');
const Trip = require('./Trip');
const DataPoint = require('./DataPoint');
const Score = require('./Score');

// Define associations

// User associations
User.belongsTo(FamilyAccount, { 
  foreignKey: 'family_id', 
  as: 'family' 
});

User.hasMany(Trip, { 
  foreignKey: 'user_id', 
  as: 'trips' 
});

// FamilyAccount associations
FamilyAccount.hasMany(User, { 
  foreignKey: 'family_id', 
  as: 'members' 
});

// Trip associations
Trip.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

Trip.belongsTo(Score, { 
  foreignKey: 'score_id', 
  as: 'score' 
});

Trip.hasMany(DataPoint, { 
  foreignKey: 'trip_id', 
  as: 'datapoints' 
});

// Score associations
Score.hasMany(Trip, { 
  foreignKey: 'score_id', 
  as: 'trips' 
});

// DataPoint associations
DataPoint.belongsTo(Trip, { 
  foreignKey: 'trip_id', 
  as: 'trip' 
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  FamilyAccount,
  Trip,
  DataPoint,
  Score
};

