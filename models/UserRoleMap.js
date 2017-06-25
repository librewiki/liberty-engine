'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');

class UserRoleMap extends LibertyModel {
  static init(sequelize) {
    super.init({
      userId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
      },
      roleId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
      },
    },
    {
      sequelize,
      timestamps: false,
      modelName: 'userRoleMap',
    });
  }
}

module.exports = UserRoleMap;
