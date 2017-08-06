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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ipAddress: DataTypes.ipAddress(),
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
    this.belongsTo(models.User);
  }

  getPublicObject() {
    return {
      filename: this.filename,
      user: this.user ? this.user.username : null,
      ipAddress: this.author ? null : this.ipAddress,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = MediaFile;
