'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Citas', 'paymentProofPath', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Citas', 'referenceNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Citas', 'paymentProofPath');
    await queryInterface.removeColumn('Citas', 'referenceNumber');
  }
};
