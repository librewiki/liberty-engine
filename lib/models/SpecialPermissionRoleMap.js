'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');

class SpecialPermissionRoleMap extends LibertyModel {
  static getAttributes() {
    return {
      specialPermissionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    };
  }

  static getOptions() {
    return {
      timestamps: false,
    };
  }
}

module.exports = SpecialPermissionRoleMap;
