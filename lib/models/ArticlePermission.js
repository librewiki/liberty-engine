'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class ArticlePermission extends LibertyModel {
  static getAttributes() {
    return {
      articleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      readable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },
      editable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },
      renamable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
      },
      deletable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null,
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
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    this.belongsTo(models.Role, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

module.exports = ArticlePermission;
