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

/**
 * Generate a random 6-character invite code
 * Format: A1B2C3 (alphanumeric, uppercase)
 * @returns {string} 6-character invite code
 */
FamilyAccount.prototype.generateInviteCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Check if invite code is valid (created within 48 hours)
 * Note: This requires a created_at field in the database
 * If created_at doesn't exist, this will always return true
 * @returns {boolean} True if code is valid
 */
FamilyAccount.prototype.isInviteCodeValid = function() {
  // If database doesn't have created_at, we can't check expiration
  // Return true as a fallback
  if (!this.created_at) {
    return true;
  }

  const createdAt = new Date(this.created_at);
  const now = new Date();
  const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
  
  return hoursSinceCreation < 48;
};

module.exports = FamilyAccount;

