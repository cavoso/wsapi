const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Entity = sequelize.define('entity', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  },
  synonyms: {
    type: DataTypes.TEXT,
    allowNull: true,
    get: function () {
      const value = this.getDataValue('synonyms');
      return value ? value.split(',') : [];
    },
    set: function (value) {
      if (value instanceof Array) {
        value = value.join(', ');
      }
      this.setDataValue('synonyms', value);
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'entities',
  charset: 'latin1',
  collate: 'latin1_swedish_ci'
});

module.exports = Entity;