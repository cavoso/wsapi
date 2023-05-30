const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Department = require('./Department');

const Agent = sequelize.define('Agent', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  agent_type: {
    type: DataTypes.ENUM('SELLER', 'DISTRIBUTOR'),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  department_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: Department,
      key: 'id'
    }
  }
}, {
  tableName: 'agents',
  timestamps: false
});

module.exports = Agent;
