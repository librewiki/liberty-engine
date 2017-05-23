/**
 * Provides Redirection model.
 *
 * @module models
 * @submodule Redirection
 */

'use strict';

/**
 * Model representing redirection.
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
    sourceNamespaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sourceTitle: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },

    /**
     * lowercased source title.
     *
     * @property lowercaseSourceTitle
     * @readOnly
     * @type String
     */
    lowercaseSourceTitle: 'VARCHAR(128) AS (lower(`sourceTitle`)) PERSISTENT',

    destinationArticleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    indexes: [{
      unique: true, fields: ['sourceNamespaceId', 'sourceTitle']
    }, {
      fields: ['lowercaseSourceTitle']
    }],
    classMethods: {
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
