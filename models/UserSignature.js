'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class UserSignature extends LibertyModel {
  static getAttributes() {
    return {
      /**
       * Owner's id. Used as primary key.
       *
       * @property userId
       * @type Number
       */
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      text: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      treatWikitext: {
        type: Sequelize.BOOLEAN,
      },
    };
  }
  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.belongsTo(models.User, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

module.exports = UserSignature;
