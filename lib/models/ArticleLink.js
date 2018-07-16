'use strict';

const DataTypes = require('../DataTypes');
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
        type: DataTypes.STRING(128),
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

  static findLinks(fullTitle) {
    const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
    return this.findAll({
      where: {
        destinationNamespaceId: namespace.id,
        destinationTitle: title,
      },
      include: [{
        association: this.associations.sourceArticle,
      }],
    });
  }

  static updateLinks({ sourceArticle, linkSet, transaction }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const articleLinks = Array.from(linkSet).map((fullTitle) => {
        const { namespace, title } = models.Namespace.splitFullTitle(fullTitle);
        return {
          destinationNamespaceId: namespace.id,
          destinationTitle: title,
          sourceArticleId: sourceArticle.id,
        };
      });
      await this.destroy({
        where: {
          sourceArticleId: sourceArticle.id,
        },
        transaction,
      });
      await this.bulkCreate(articleLinks, { transaction });
    });
  }
}

module.exports = ArticleLink;
