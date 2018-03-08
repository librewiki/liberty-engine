'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`INSERT INTO specialPermission (name, createdAt)
    VALUES ("ADD_REMOVE_ROLE", NOW()), ("SET_EMAIL", NOW()), ("SET_LANGUAGE", NOW()), ("SET_DISCUSSION_STATUS", NOW())`);
    await queryInterface.sequelize.query(`UPDATE specialPermission
      SET name = "GRANT_REVOKE_ROLE" WHERE name = "SET_USER_ROLE"`);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`DELETE FROM specialPermission
      WHERE name IN ("SET_EMAIL", "ADD_REMOVE_ROLE", "SET_LANGUAGE", "SET_DISCUSSION_STATUS")`);
    await queryInterface.sequelize.query(`UPDATE specialPermission
      SET name = "SET_USER_ROLE" WHERE name = "GRANT_REVOKE_ROLE"`);
  },
};
