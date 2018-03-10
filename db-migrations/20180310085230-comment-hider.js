'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'discussionComment',
      'hiderId',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      }
    );
    await queryInterface.addConstraint(
      'discussionComment', ['hiderId'],
      {
        type: 'foreign key',
        references: {
          table: 'user',
          field: 'id',
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('discussionComment', 'discussionComment_hiderId_user_fk');
    await queryInterface.removeColumn('discussionComment', 'hiderId');
  },
};
