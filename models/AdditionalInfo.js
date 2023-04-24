const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AdditionalInfo = sequelize.define('AdditionalInfo', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  ticket_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  key_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  create_by: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('NOW()'),
    set(value) {
      // Prevenir cambios en el campo después de la creación
      if (this.getDataValue('create_by')) {
        throw new Error('create_by cannot be updated after creation');
      }
      this.setDataValue('create_by', value);
    },
    get() {
      // Hacer el campo de solo lectura después de la creación
      if (this.getDataValue('create_by')) {
        return this.getDataValue('create_by');
      }
      return null;
    }
  }
}, {
  tableName: 'additional_info',
  timestamps: false
});

module.exports = AdditionalInfo;
