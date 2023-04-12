const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserDepartamento = sequelize.define('UserDepartamento', {
  departamento: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  usuario: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'UserDepartamento'
});

module.exports = UserDepartamento;
