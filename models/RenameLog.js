/**
 * Provides RenameLog model.
 *
 * @module models
 * @submodule RenameLog
 */

'use strict';

/**
 * Model representing renaming logs.
 *
 * @class RenameLog
 */
module.exports = function(sequelize, DataTypes) {
  const RenameLog = sequelize.define('renameLog', {
    /**
     * Id of the revision. Used as primary key.
     *
     * @property revisionId
     * @type Number
     */
    revisionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    oldNamespaceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    oldTitle: {
      type: DataTypes.STRING,
      allowNull: false
    },

    newNamespaceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    newTitle: {
      type: DataTypes.STRING,
      allowNull: false
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
        RenameLog.belongsTo(models.Namespace, { as: 'oldNamespace' });
        RenameLog.belongsTo(models.Namespace, { as: 'newNamespace' });
        RenameLog.belongsTo(models.Revision, {
          onDelete: 'CASCADE', onUpdate: 'CASCADE'
        });
      }
    }
  });
  return RenameLog;
};
