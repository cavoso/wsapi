const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Intent = require('./intent');
const Entity = require('./entity');
const MenuVehiculos = require('./menuvehiculos');

module.exports = {
  sequelize,
  Intent,
  Entity,
  MenuVehiculos
};