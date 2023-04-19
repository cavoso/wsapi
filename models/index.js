const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cliente = require('./cliente');
const Departamento = require('./departamento');
const Ticket = require('./ticket');
const TicketMensajes = require('./ticketmensaje');
const UserDepartamento = require('./userdepartamento');

const Intent = require()

module.exports = {
  sequelize
};