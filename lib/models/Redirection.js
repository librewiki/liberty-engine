'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class Redirection extends LibertyModel {
  static getAttributes() {
    return {
      sourceNamespaceId: {
        primaryKey: true,
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      sourceTitle: {
        primaryKey: true,
        type: DataTypes.STRING(128),
        allowNull: false,
      },

      /**
       * lowercased source title.
       *
       * @property lowercaseSourceTitle
       * @readOnly
       * @type String
       */
      lowercaseSourceTitle: 'VARCHAR(128) AS (lower(`sourceTitle`)) PERSISTENT',

      destinationArticleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    };
  }

  static getOptions() {
    return {
      indexes: [{
        fields: ['destinationArticleId'],
      }, {
        fields: ['lowercaseSourceTitle'],
      }],
    };
  }

  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.belongsTo(models.Namespace, { as: 'sourceNamespace' });
    this.belongsTo(models.Article, {
      as: 'destinationArticle',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

module.exports = Redirection;
