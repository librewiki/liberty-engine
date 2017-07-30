'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class MediaFile extends LibertyModel {
  static getAttributes() {
    return {
      descriptionArticleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      filename: {
        // filename would be uuid v4 + . + extension
        type: DataTypes.STRING(72),
        allowNull: false,
      },
    };
  }
  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.belongsTo(models.Article, {
      as: 'descriptionArticle',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

module.exports = MediaFile;
