/**
 * Provides RedirectionLog model.
 *
 * @module models
 * @submodule RedirectionLog
 */

'use strict';

const CustomDataTypes = require('../src/CustomDataTypes');

/**
 * Model representing redirection log.
 *
 * @class RedirectionLog
 */
module.exports = function(sequelize, DataTypes) {
  const RedirectionLog = sequelize.define('redirectionLog', {
    /**
     * Primary key.
     *
     * @property id
     * @type Number
     */
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    type: {
      type: DataTypes.ENUM('ADD', 'DELETE'),
      validation: {
        isIn: [['ADD', 'DELETE']]
      },
      allowNull: false
    },

    sourceNamespaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sourceTitle: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },

    destinationArticleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    /**
     * Id of user who make this redirection.
     *
     * @property userId
     * @type String
     */
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    ipAddress: CustomDataTypes.ipAddress(),
  }, {
    indexes: [{
      fields: ['sourceNamespaceId', 'sourceTitle']
    }],
    classMethods: {
      /**
       * Describes associations.
       * @method associate
       * @static
       * @param {Object} models
       */
      associate(models) {
        RedirectionLog.belongsTo(models.Namespace, { as: 'sourceNamespace' });
        RedirectionLog.belongsTo(models.Article, {
          as: 'destinationArticle',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      }
    }
  });
  return RedirectionLog;
};
