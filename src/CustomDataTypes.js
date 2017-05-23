'use strict';

const ip = require('ip');

module.exports = {
  ipAddress() {
    return {
      type: 'VARBINARY(16)',
      allowNull: false,
      set(ipAddress) {
        this.setDataValue('ipAddress', ip.toBuffer(ipAddress));
      },
      get() {
        if (!this.getDataValue('ipAddress')) {
          return undefined;
        }
        return ip.toString(this.getDataValue('ipAddress'));
      }
    };
  },
};
