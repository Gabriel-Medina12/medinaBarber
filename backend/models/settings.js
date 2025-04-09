'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Settings extends Model {
    static associate(models) {
      // define association here
    }
  }
  
  Settings.init({
    services: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [
        { id: "haircut", name: "Corte de cabello", price: 150, duration: 30 },
        { id: "beard", name: "Afeitado de barba", price: 100, duration: 20 },
        { id: "beard", name: "Alineado de barba", price: 80, duration: 15 },
        { id: "paquetes", name: "Paquete 1", price: 200, duration: 45 },
        { id: "paquetes", name: "Paquete 2", price: 250, duration: 60 },
        { id: "paquetes", name: "Paquete 3", price: 300, duration: 75 },
        { id: "paquetes", name: "Paquete 4", price: 350, duration: 90 },
      ]
    },
    timeSlots: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
      ]
    }
  }, {
    sequelize,
    modelName: 'Settings',
  });
  
  return Settings;
};
