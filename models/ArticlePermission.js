/**
 * Provides ArticlePermission model.
 *
 * @module models
 * @submodule ArticlePermission
 */

'use strict';

/**
 * Model representing article level permissions.
 *
 * @class ArticlePermission
 */
module.exports = function(sequelize, DataTypes) {
  const ArticlePermission = sequelize.define('articlePermission', {
    articleId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    roleId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    create: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    edit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    rename: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    delete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  }, {
    classMethods: {
      /**
       * Describes associations.
       * @method associate
       * @static
       * @param {Object} models
       */
      associate(models) {
        ArticlePermission.belongsTo(models.Article, {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
        ArticlePermission.belongsTo(models.Role, {
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });
      },
    }
  });
  return ArticlePermission;
};
