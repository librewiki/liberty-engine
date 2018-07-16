'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class RedirectionLog extends LibertyModel {
  static getAttributes() {
    return {
      /**
       * Primary key.
       *
       * @property id
       * @type Number
       */
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      type: {
        type: DataTypes.ENUM('ADD', 'DELETE'),
        validation: {
          isIn: [['ADD', 'DELETE']],
        },
        allowNull: false,
      },

      sourceNamespaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      sourceTitle: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },

      destinationArticleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      /**
       * Id of user who make this redirection.
       *
       * @property userId
       * @type String
       */
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      ipAddress: DataTypes.ipAddress(),
    };
  }

  static getOptions() {
    return {
      indexes: [{
        fields: ['sourceNamespaceId', 'sourceTitle'],
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

module.exports = RedirectionLog;
