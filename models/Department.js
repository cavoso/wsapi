const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  phone_number_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  icono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  mensaje: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  entity: {
    type: DataTypes.STRING(255),
    allowNull: true,
    get() {
      const value = this.getDataValue('entity');
      return value ? value.split(',').map(s => s.trim()) : [];
    },
    set(value) {
      if (Array.isArray(value)) {
        value = value.join(',');
      }
      this.setDataValue('entity', value);
    }
  }
}, {
  tableName: 'departments',
  timestamps: false
});

module.exports = Department;
