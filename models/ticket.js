const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  waid: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  departamento: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sucursal: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDIENTE', 'ACTIVO', 'FINALIZADO'),
    defaultValue: 'PENDIENTE'
  },
  inbot: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 1
  },
  ultimomensaje: {
    type: DataTypes.DATE,
    allowNull: true
  },
  vendedor: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'Ticket',
  timestamps: false
});

module.exports = Ticket;