'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class NamespacePermission extends LibertyModel {
  static init(sequelize) {
    super.init({
      namespaceId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      roleId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      create: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      edit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      rename: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      delete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'namespacePermission',
    });
  }
  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {
    this.belongsTo(models.Namespace, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    this.belongsTo(models.Role, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

module.exports = NamespacePermission;
