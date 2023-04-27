const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  wa_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  profile_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  nofilldatabot: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'clients',
  timestamps: false
});

Client.prototype.getDisplayName = function() {
  return this.full_name.trim() || this.profile_name.trim();
};

Client.prototype.hasData = function() {
  return !!(this.full_name && this.full_name.trim() || this.email && this.email.trim());
};

module.exports = Client;
