const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Intent = sequelize.define('intent', {
  id: {
    type: Sequelize.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: Sequelize.ENUM('DOCUMENT', 'ANSWER'),
    defaultValue: 'DOCUMENT',
  },
  intent: {
    type: Sequelize.STRING(30),
    allowNull: true,
  },
  texto: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'intents',
  timestamps: false,
  underscored: true,
});

module.exports = Intent;