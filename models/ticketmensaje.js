const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TicketMensaje = sequelize.define('TicketMensaje', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  ticket: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  waid: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  wamid: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'Ticket_Mensajes',
  timestamps: false,
});

module.exports = TicketMensaje;
