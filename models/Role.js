/**
 * Provides Role model.
 *
 * @module models
 * @submodule Role
 */

'use strict';

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
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
      }
    },
  });
  return Role;
};
