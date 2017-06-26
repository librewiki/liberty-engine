'use strict';

const DataTypes = require('../src/DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class RenameLog extends LibertyModel {
  static getAttributes() {
    return {
      /**
       * Id of the revision. Used as primary key.
       *
       * @property revisionId
       * @type Number
       */
      revisionId: {
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
    this.belongsTo(models.Revision, {
      onDelete: 'CASCADE', onUpdate: 'CASCADE',
    });
  }
}

module.exports = RenameLog;
