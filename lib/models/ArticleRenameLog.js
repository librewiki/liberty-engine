'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class ArticleRenameLog extends LibertyModel {
  static getAttributes() {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      oldNamespaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      oldTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      newNamespaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      newTitle: {
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
    this.belongsTo(models.Namespace, { as: 'oldNamespace' });
    this.belongsTo(models.Namespace, { as: 'newNamespace' });
  }

  static getOptions() {
    return {
      updatedAt: false,
    };
  }
}

module.exports = ArticleRenameLog;
