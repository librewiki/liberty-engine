'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');

class UserRoleMap extends LibertyModel {
  static getAttributes() {
    return {
      userId: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.INTEGER(11),
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

module.exports = UserRoleMap;
