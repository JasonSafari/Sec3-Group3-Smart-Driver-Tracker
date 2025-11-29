const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Score = sequelize.define('Score', {
  score_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'score_id'
  },
  overall_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'overall_score',
    validate: {
      min: { args: [0], msg: 'Overall score cannot be negative' },
      max: { args: [100], msg: 'Overall score cannot exceed 100' }
    }
  },
  speed_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'speed_score',
    validate: {
      min: { args: [0], msg: 'Speed score cannot be negative' },
      max: { args: [100], msg: 'Speed score cannot exceed 100' }
    }
  },
  brake_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'brake_score',
    validate: {
      min: { args: [0], msg: 'Brake score cannot be negative' },
      max: { args: [100], msg: 'Brake score cannot exceed 100' }
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'scores',
  timestamps: false, // Using created_at from DB
  underscored: true
});

module.exports = Score;

