const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Departamento = sequelize.define('Departamento', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Departamento',
  timestamps: false
});

module.exports = Departamento;