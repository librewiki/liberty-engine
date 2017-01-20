/**
 * Provides UserGroup model.
 *
 * @module models
 * @submodule UserGroup
 */

'use strict';

/**
 * Model representing usergroups.
 *
 * @class UserGroup
 */
module.exports = function(sequelize, DataTypes) {
  const UserGroup = sequelize.define('userGroup', {
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
        UserGroup.belongsToMany(models.User, { through: 'userUserGroups' });
      }
    },
  });
  return UserGroup;
};
