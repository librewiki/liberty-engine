'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class SpecialPermission extends LibertyModel {
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
    this.belongsToMany(models.Role, {
      through: models.SpecialPermissionRoleMap,
    });
  }

  static async initialize() {
    this.idKeyMap.clear();
    this.nameKeyMap.clear();
    const permissions = await this.findAll();
    for (const permission of permissions) {
      this.idKeyMap.set(permission.id, permission);
      this.nameKeyMap.set(permission.name, permission);
    }
  }

  static getByName(name) {
    return this.nameKeyMap.get(name) || null;
  }
}

SpecialPermission.idKeyMap = new Map();
SpecialPermission.nameKeyMap = new Map();

module.exports = SpecialPermission;
