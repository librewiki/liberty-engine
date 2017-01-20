/**
 * Provides UserSignature model.
 *
 * @module models
 * @submodule UserSignature
 */

'use strict';

/**
 * Model representing signatures.
 *
 * @class UserSignature
 */
module.exports = function(sequelize, DataTypes) {
  const UserSignature = sequelize.define('userSignature', {
    /**
     * Owner's id. Used as primary key.
     *
     * @property userId
     * @type Number
     */
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    treatWikitext: {
      type: DataTypes.BOOLEAN
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
        UserSignature.belongsTo(models.User, {
          onDelete: 'CASCADE', onUpdate: 'CASCADE'
        });
      }
    }
  });
  return UserSignature;
};
