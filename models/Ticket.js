const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Department = require('./Department');
const Agent = require('./Agent');
const Client = require('./Client');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  department_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: Department,
      key: 'id'
    }
  },
  agent_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: Agent,
      key: 'id'
    }
  },
  wa_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: Client,
      key: 'wa_id'
    }
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'CLOSED'),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  last_updated_message_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  available_to_all: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Ticket;
