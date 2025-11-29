const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DataPoint = sequelize.define('DataPoint', {
  point_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'point_id'
  },
  trip_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'trip_id',
    validate: {
      notEmpty: { msg: 'Trip ID is required' }
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'timestamp',
    defaultValue: DataTypes.NOW
  },
  latitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
    field: 'latitude',
    validate: {
      min: { args: [-90], msg: 'Latitude must be between -90 and 90' },
      max: { args: [90], msg: 'Latitude must be between -90 and 90' }
    }
  },
  longitude: {
    type: DataTypes.DECIMAL(9, 6),
    allowNull: true,
    field: 'longitude',
    validate: {
      min: { args: [-180], msg: 'Longitude must be between -180 and 180' },
      max: { args: [180], msg: 'Longitude must be between -180 and 180' }
    }
  },
  speed: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'speed',
    validate: {
      min: { args: [0], msg: 'Speed cannot be negative' }
    }
  },
  acceleration: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'acceleration'
  }
}, {
  tableName: 'datapoints',
  timestamps: false,
  underscored: true
});

module.exports = DataPoint;

