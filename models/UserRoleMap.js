'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');

class UserRoleMap extends LibertyModel {
  static getAttributes() {
    return {
      userId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
      },
      roleId: {
        type: Sequelize.INTEGER(11),
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
