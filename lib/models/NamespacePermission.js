'use strict';

const DataTypes = require('../DataTypes');
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
      readable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      creatable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      editable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      renamable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deletable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
