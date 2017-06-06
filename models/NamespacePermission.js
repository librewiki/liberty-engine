/**
 * Provides NamespacePermission model.
 *
 * @module models
 * @submodule NamespacePermission
 */

'use strict';

/**
 * Model representing namespace-wide permissions.
 *
 * @class NamespacePermission
 */
module.exports = function(sequelize, DataTypes) {
  const NamespacePermission = sequelize.define('namespacePermission', {
    namespaceId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    roleId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    create: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    edit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    rename: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    delete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  }, {
    classMethods: {
    }
  });
  return NamespacePermission;
};
