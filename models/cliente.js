const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

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
    allowNull: true,
    defaultValue: null
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
  },
   nofilldatabot: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: 0
  }
}, {
  timestamps: false,
  tableName: 'Cliente'
});

Cliente.prototype.nombreOwaProfile = function() {
  return this.nombres || this.waprofile;
}

module.exports = Cliente;
