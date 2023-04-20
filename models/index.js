const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Intent = require('./intent');
const Entity = require('./entity');
const MenuVehiculos = require('./menuvehiculos');
const AdditionalInfo = require('./AdditionalInfo');
const Agent = require('./Agent');
const Client = require('./Client');
const Department = require('./Department');
const Message = require('./Message');
const Ticket = require('./Ticket');


module.exports = {
  sequelize,
  Intent,
  Entity,
  MenuVehiculos,
  AdditionalInfo,
  Agent,
  Client,
  Department,
  Message,
  Ticket
};