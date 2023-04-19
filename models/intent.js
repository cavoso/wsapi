const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Intent = sequelize.define('intent', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  tipo: {
    type: DataTypes.ENUM('DOCUMENT', 'ANSWER'),
    defaultValue: 'DOCUMENT'
  },
  intent: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  texto: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'intents',
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = Intent;