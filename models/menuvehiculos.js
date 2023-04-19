const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MenuVehiculos = sequelize.define('menuvehiculos', {
  id: {
    type: Sequelize.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  padre: {
    type: Sequelize.BIGINT.UNSIGNED,
    allowNull: true
  },
  activo: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  timestamps: false,
  tableName: 'menuvehiculos'
});

module.exports = MenuVehiculos;
