'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class Role extends LibertyModel {
  static getAttributes() {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
      },
    };
  }
  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.belongsToMany(models.User, {
      through: models.UserRoleMap,
    });
    this.belongsToMany(models.SpecialPermission, {
      through: models.SpecialPermissionRoleMap,
    });
  }
  static async initialize() {
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
  hasSpecialPermissionTo(permissionName) {
    if (this.name === 'root') return true;
    const permissionSet = Role.permissionSets.get(this.id);
    return permissionSet.has(permissionName);
  }
}

Role.permissionSets = new Map();

module.exports = Role;
