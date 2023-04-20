const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  whatsapp_api_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'departments',
  timestamps: false
});

module.exports = Department;
