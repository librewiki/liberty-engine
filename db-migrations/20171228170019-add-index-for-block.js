'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex(
      'block',
      {
        fields: ['userId'],
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('block', 'block_user_id');
  },
};
