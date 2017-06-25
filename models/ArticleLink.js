'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class ArticleLink extends LibertyModel {
  static init(sequelize) {
    super.init({
      destinationNamespaceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      destinationTitle: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      sourceArticleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'articleLink',
      indexes: [{
        fields: ['sourceArticleId'],
      }],
    });
  }
  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.belongsTo(models.Namespace, { as: 'destinationNamespace' });
    this.belongsTo(models.Article, {
      as: 'sourceArticle',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

module.exports = ArticleLink;
