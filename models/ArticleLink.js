'use strict';

const DataTypes = require('../src/DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class ArticleLink extends LibertyModel {
  static getAttributes() {
    return {
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
    };
  }
  static getOptions() {
    return {
      indexes: [{
        fields: ['sourceArticleId'],
      }],
    };
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
