'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');

class SpecialPermissionRoleMap extends LibertyModel {
  static init(sequelize) {
    super.init({
      specialPermissionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      roleId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
    },
    {
      sequelize,
      timestamps: false,
      modelName: 'specialPermissionRoleMap',
    });
  }
}

module.exports = SpecialPermissionRoleMap;
