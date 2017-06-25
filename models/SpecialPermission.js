'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class SpecialPermission extends LibertyModel {
  static init(sequelize) {
    super.init({
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'specialPermission',
    });
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
