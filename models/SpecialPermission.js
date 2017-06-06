/**
 * Provides SpecialPermission model.
 *
 * @module models
 * @submodule SpecialPermission
 */

'use strict';

/**
 * Model representing wiki-wide permissions.
 *
 * @class SpecialPermission
 */
module.exports = function(sequelize, DataTypes) {
  const SpecialPermission = sequelize.define('specialPermission', {
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
  }, {
    classMethods: {
      /**
       * Describes associations.
       * @method associate
       * @static
       * @param {Object} models
       */
      associate(models) {
        SpecialPermission.belongsToMany(models.Role, { through: models.SpecialPermissionRole });
      },
      idKeyMap: new Map(),
      nameKeyMap: new Map(),
      async initialize() {
        this.idKeyMap.clear();
        this.nameKeyMap.clear();
        const permissions = await this.findAll();
        for (const permission of permissions) {
          this.idKeyMap.set(permission.id, permission);
          this.nameKeyMap.set(permission.name, permission);
        }
      },
      getByName(name) {
        return this.nameKeyMap.get(name) || null;
      },
    },
  });
  return SpecialPermission;
};
