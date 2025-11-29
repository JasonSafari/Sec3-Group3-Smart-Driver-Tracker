const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trip = sequelize.define('Trip', {
  trip_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'trip_id'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_time'
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_time'
  },
  distance_km: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    field: 'distance_km',
    validate: {
      min: { args: [0], msg: 'Distance cannot be negative' }
    }
  },
  avg_speed: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'avg_speed',
    validate: {
      min: { args: [0], msg: 'Average speed cannot be negative' }
    }
  },
  score_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'score_id'
  }
}, {
  tableName: 'trips',
  timestamps: false,
  underscored: true
});

// Define associations (after models are loaded)
// This will be set up in a separate associations file or after User model is loaded

module.exports = Trip;

