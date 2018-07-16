'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class FileLink extends LibertyModel {
  static getAttributes() {
    return {
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
    this.belongsTo(models.Article, {
      as: 'sourceArticle',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }

  static findLinks(title) {
    return this.findAll({
      where: {
        destinationTitle: title,
      },
      include: [{
        association: this.associations.sourceArticle,
      }],
    });
  }

  static updateLinks({ sourceArticle, linkSet, transaction }) {
    return this.autoTransaction(transaction, async (transaction) => {
      const fileLinks = Array.from(linkSet)
        .map(title => ({
          destinationTitle: title,
          sourceArticleId: sourceArticle.id,
        }));
      await this.destroy({
        where: {
          sourceArticleId: sourceArticle.id,
        },
        transaction,
      });
      await this.bulkCreate(fileLinks, { transaction });
    });
  }
}

module.exports = FileLink;
