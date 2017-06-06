/**
 * Provides SpecialPermissionRole model.
 *
 * @module models
 * @submodule SpecialPermissionRole
 */

'use strict';

/**
 * Model connecting special permissions to roles.
 *
 * @class SpecialPermissionRole
 */
module.exports = function(sequelize, DataTypes) {
  const SpecialPermissionRole = sequelize.define('specialPermissionRole', {
    specialPermissionId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    roleId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
  });
  return SpecialPermissionRole;
};
