'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');
const models = require('./');
const CustomDataTypes = require('../src/CustomDataTypes');

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
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      type: {
        type: Sequelize.ENUM('ADD', 'DELETE'),
        validation: {
          isIn: [['ADD', 'DELETE']],
        },
        allowNull: false,
      },

      sourceNamespaceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      sourceTitle: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },

      destinationArticleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      /**
       * Id of user who make this redirection.
       *
       * @property userId
       * @type String
       */
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      ipAddress: CustomDataTypes.ipAddress(),
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
