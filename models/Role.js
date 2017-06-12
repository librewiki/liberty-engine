/**
 * Provides Role model.
 *
 * @module models
 * @submodule Role
 */

'use strict';

const models = require('./');

/**
 * Model representing roles.
 *
 * @class Role
 */
module.exports = function(sequelize, DataTypes) {
  const Role = sequelize.define('role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true
    }
  }, {
    classMethods: {
      /**
       * Describes associations.
       * @method associate
       * @static
       * @param {Object} models
       */
      associate(models) {
        Role.belongsToMany(models.User, { through: models.UserRole });
        Role.belongsToMany(models.SpecialPermission, { through: models.SpecialPermissionRole });
      },
      permissionSets: new Map(),
      async initialize() {
        this.permissionSets.clear();
        const roles = await this.findAll({ include: models.SpecialPermission });
        for (const role of roles) {
          const permissionSet = new Set();
          this.permissionSets.set(role.id, permissionSet);
          for (const permission of role.specialPermissions) {
            permissionSet.add(permission.name);
          }
        }
      }
    },
    instanceMethods: {
      hasSpecialPermissionTo(permissionName) {
        if (this.name === 'root') return true;
        const permissionSet = Role.permissionSets.get(this.id);
        return permissionSet.has(permissionName);
      },
    },
  });
  return Role;
};
