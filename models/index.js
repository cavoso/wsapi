const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cliente = require('./cliente')(sequelize, DataTypes);
const Departamento = require('./departamento')(sequelize, DataTypes);
const Ticket = require('./ticket')(sequelize, DataTypes);
const TicketMensajes = require('./ticketMensajes')(sequelize, DataTypes);
const UserDepartamento = require('./userDepartamento')(sequelize, DataTypes);

module.exports = {
  Cliente,
  Departamento,
  Ticket,
  TicketMensajes,
  UserDepartamento
};