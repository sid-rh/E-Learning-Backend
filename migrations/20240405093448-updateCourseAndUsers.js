'use strict';

const sequelize = require('../Config/Sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Users','enrolled',{
      type:Sequelize.INTEGER,
      defaultValue:0
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users','enrolled');
  }
};
