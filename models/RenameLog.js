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

    sourceNamespaceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    sourceTitle: {
      type: DataTypes.STRING,
      allowNull: false
    },

    destinationNamespaceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    destinationTitle: {
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
        RenameLog.belongsTo(models.Namespace, { as: 'sourceNamespace' });
        RenameLog.belongsTo(models.Namespace, { as: 'destinationNamespace' });
        RenameLog.belongsTo(models.Revision, {
          onDelete: 'CASCADE', onUpdate: 'CASCADE'
        });
      }
    }
  });
  return RenameLog;
};
