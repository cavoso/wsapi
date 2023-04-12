const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  waid: {
    type: DataTypes.BIGINT.UNSIGNED,
    unique: true,
    allowNull: true,
    defaultValue: null
  },
  waprofile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nombres: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paterno: {
    type: DataTypes.STRING,
    allowNull: true
  },
  materno: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ciudad: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'Cliente'
});

module.exports = Cliente;
