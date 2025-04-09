'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      services: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: JSON.stringify([
          { id: "haircut", name: "Corte de cabello", price: 150, duration: 30 },
          { id: "beard", name: "Afeitado de barba", price: 100, duration: 20 },
          { id: "beard", name: "Alineado de barba", price: 80, duration: 15 },
          { id: "paquetes", name: "Corte + Refrigerio", price: 8, duration: 75 },
          { id: "paquetes", name: "Corte + Barba", price: 8, duration: 90 },  
        ])
      },
      timeSlots: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: JSON.stringify([
          "10:00", "10:30", "11:00", "11:30",
          "12:00", "12:30", "13:00", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
        ])
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Insertar un registro inicial
    await queryInterface.bulkInsert('Settings', [{
      services: JSON.stringify([
        { id: "haircut", name: "Corte de cabello", price: 150, duration: 30 },
        { id: "beard", name: "Afeitado de barba", price: 100, duration: 20 },
        { id: "beard", name: "Alineado de barba", price: 80, duration: 15 },
        { id: "paquetes", name: "Corte + Refrigerio", price: 8, duration: 75 },
        { id: "paquetes", name: "Corte + Barba", price: 8, duration: 90 },  
      ]),
      timeSlots: JSON.stringify([
        "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
      ]),
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Settings');
  }
};
