/**
 * Provides RedirectionLog model.
 *
 * @module models
 * @submodule RedirectionLog
 */

'use strict';

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

    /**
     * Name of namespace.
     *
     * @property sourceNamespaceId
     * @type String
     */
    sourceNamespaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    /**
     * Name of namespace.
     *
     * @property sourceTitle
     * @type String
     */
    sourceTitle: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true
    },

    /**
     * Name of namespace.
     *
     * @property destinationArticleId
     * @type String
     */
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
    }
  }, {
    classMethods: {
      indexes: [{
        fields: ['namespaceId', 'title']
      }],
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
