'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');

class SpecialPermissionRoleMap extends LibertyModel {
  static getAttributes() {
    return {
      specialPermissionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      roleId: {
        type: Sequelize.INTEGER,
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
