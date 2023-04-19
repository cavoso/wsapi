const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Intent = require('./intent');

module.exports = {
  sequelize,
  Intent
};