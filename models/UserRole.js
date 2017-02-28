/**
 * Provides UserRole model.
 *
 * @module models
 * @submodule User
 */

'use strict';

/**
 * Model connecting users to roles.
 *
 * @class UserRole
 */
module.exports = function(sequelize, DataTypes) {
  const UserRole = sequelize.define('userRole', {
    userId: {
      type: DataTypes.INTEGER(11),
      primaryKey: true
    },
    roleId: {
      type: DataTypes.INTEGER(11),
      primaryKey: true
    },
  });
  return UserRole;
};
