/**
 * Provides ArticleLink model.
 *
 * @module models
 * @submodule ArticleLink
 */

'use strict';

/**
 * Model representing link between articles.
 *
 * @class ArticleLink
 */
module.exports = function(sequelize, DataTypes) {
  const ArticleLink = sequelize.define('articleLink', {
    destinationNamespaceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    destinationTitle: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    sourceArticleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  }, {
    indexes: [{
      fields: ['sourceArticleId']
    }],
    classMethods: {
      /**
       * Describes associations.
       * @method associate
       * @static
       * @param {Object} models
       */
      associate(models) {
        ArticleLink.belongsTo(models.Namespace, { as: 'destinationNamespace' });
        ArticleLink.belongsTo(models.Article, {
          as: 'sourceArticle',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      }
    }
  });
  return ArticleLink;
};
