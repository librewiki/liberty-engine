'use strict';

const DataTypes = require('../DataTypes');
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
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      treatWikitext: {
        type: DataTypes.BOOLEAN,
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
