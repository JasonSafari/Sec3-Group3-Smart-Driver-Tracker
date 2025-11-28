const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'user_id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name is required' },
      len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'Email already exists'
    },
    validate: {
      isEmail: { msg: 'Must be a valid email address' },
      notEmpty: { msg: 'Email is required' }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
  },
  password: {
    type: DataTypes.VIRTUAL,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
      len: { args: [8, 255], msg: 'Password must be at least 8 characters' }
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password'
  },
  role: {
    type: DataTypes.ENUM('parent', 'teen'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['parent', 'teen']],
        msg: 'Role must be either parent or teen'
      }
    }
  },
  family_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'family_id'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

// Override toJSON to remove sensitive data
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.password_hash;
  return values;
};

module.exports = User;

