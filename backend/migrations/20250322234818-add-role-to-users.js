'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.STRING, // Tipo de dato para el rol
      allowNull: false,        // No permite valores nulos
      defaultValue: 'user'     // Valor por defecto (puedes cambiarlo según tus necesidades)
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'role');
  }
};
