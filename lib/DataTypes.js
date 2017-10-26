'use strict';

const ip = require('ip');
const Sequelize = require('sequelize');

module.exports = Object.assign({
  ipAddress(name = 'ipAddress') {
    return {
      type: 'VARBINARY(16)',
      allowNull: false,
      set(ipAddress) {
        this.setDataValue(name, ip.toBuffer(ipAddress));
      },
      get() {
        if (!this.getDataValue(name)) {
          return undefined;
        }
        return ip.toString(this.getDataValue(name));
      },
    };
  },
}, Sequelize.DataTypes);
