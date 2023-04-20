const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AdditionalInfo = sequelize.define('additional_info', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  ticket_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  key_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  }
}, {
  tableName: 'additional_info',
  timestamps: false
});

module.exports = AdditionalInfo;
