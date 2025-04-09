'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Citas', 'paymentMethod', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'efectivo'
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Citas', 'paymentMethod');
  }
};