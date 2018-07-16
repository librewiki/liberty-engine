'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class ArticleDeleteLog extends LibertyModel {
  static getAttributes() {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      namespaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      summary: {
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue: '',
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    this.belongsTo(models.Namespace);
  }

  static getOptions() {
    return {
      updatedAt: false,
    };
  }
}

module.exports = ArticleDeleteLog;
