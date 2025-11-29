const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FamilyAccount = sequelize.define('FamilyAccount', {
  family_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'family_id'
  },
  family_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'family_name',
    validate: {
      notEmpty: { msg: 'Family name is required' },
      len: { args: [1, 100], msg: 'Family name must be between 1 and 100 characters' }
    }
  },
  invite_code: {
    type: DataTypes.CHAR(6),
    allowNull: false,
    unique: {
      msg: 'Invite code already exists'
    },
    field: 'invite_code',
    validate: {
      len: { args: [6, 6], msg: 'Invite code must be exactly 6 characters' }
    }
  }
}, {
  tableName: 'family_accounts',
  timestamps: false,
  underscored: true
});

module.exports = FamilyAccount;

