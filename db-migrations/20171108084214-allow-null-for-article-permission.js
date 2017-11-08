'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(
      'articlePermission',
      'readable',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      }
    );
    await queryInterface.changeColumn(
      'articlePermission',
      'editable',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      }
    );
    await queryInterface.changeColumn(
      'articlePermission',
      'renamable',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      }
    );
    await queryInterface.changeColumn(
      'articlePermission',
      'deletable',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(
      'articlePermission',
      'readable',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }
    );
    await queryInterface.changeColumn(
      'articlePermission',
      'editable',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }
    );
    await queryInterface.changeColumn(
      'articlePermission',
      'renamable',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }
    );
    await queryInterface.changeColumn(
      'articlePermission',
      'deletable',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }
    );
  },
};
