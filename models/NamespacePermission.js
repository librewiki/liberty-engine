'use strict';

const DataTypes = require('../src/DataTypes');
const LibertyModel = require('./LibertyModel');
const models = require('./');

class NamespacePermission extends LibertyModel {
  static getAttributes() {
    return {
      namespaceId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
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
      },
    };
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
