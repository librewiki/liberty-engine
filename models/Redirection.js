/**
 * Provides Redirection model.
 *
 * @module models
 * @submodule Redirection
 */

'use strict';

/**
 * Model representing namespaces.
 *
 * @class Redirection
 */
module.exports = function(sequelize, DataTypes) {
  const Redirection = sequelize.define('redirection', {
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
     * lowercased source title.
     *
     * @property lowercaseSourceTitle
     * @readOnly
     * @type String
     */
    lowercaseSourceTitle: 'VARCHAR(128) AS (lower(`sourceTitle`)) PERSISTENT',

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
        unique: true, fields: ['namespaceId', 'title']
      }, {
        fields: ['lowercaseSourceTitle']
      }],
      /**
       * Describes associations.
       * @method associate
       * @static
       * @param {Object} models
       */
      associate(models) {
        Redirection.belongsTo(models.Namespace, { as: 'sourceNamespace' });
        Redirection.belongsTo(models.Article, {
          as: 'destinationArticle',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      }
    }
  });
  return Redirection;
};
