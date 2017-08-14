'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class ArticleSearch extends LibertyModel {
  static getAttributes() {
    return {
      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT('medium'),
        allowNull: false,
      },
    };
  }
  static getOptions() {
    return {
      engine: 'Mroonga',
      comment: 'engine "InnoDB"',
      indexes: [{
        type: 'FULLTEXT',
        fields: ['content'],
        // comment: 'parser "TokenBigramIgnoreBlankSplitSymbolAlphaDigit"',
        // sequelize doesn't support comment for indexes. It is handled in the install script.
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
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }

  static async search({ limit, offset, query }) {
    return this.findAll({
      limit,
      offset,
      where: {
        $and: models.sequelize.literal(`MATCH (content) AGAINST(${models.sequelize.escape(query)} IN BOOLEAN MODE)`),
      },
      include: [models.Article],
    }).map(result => result.article);
  }
}

module.exports = ArticleSearch;