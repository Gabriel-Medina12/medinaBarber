'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Citas extends Model {
    static associate(models) {
      Citas.belongsTo(models.Users, { 
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'SET NULL'
      });
    }
  }
  
  Citas.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    service: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'efectivo'
    },
    paymentProofPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Citas',
  });
  
  return Citas;
};
