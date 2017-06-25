'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class RenameLog extends LibertyModel {
  static init(sequelize) {
    super.init({
      /**
       * Id of the revision. Used as primary key.
       *
       * @property revisionId
       * @type Number
       */
      revisionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      oldNamespaceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      oldTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      newNamespaceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      newTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'renameLog',
    });
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
