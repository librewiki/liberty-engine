'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');
const { Op } = require('sequelize');
const ip = require('ip');
/*
 * @TODO clear expired objects automatically
 */
class Block extends LibertyModel {
  static getAttributes() {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      ipStart: {
        ...DataTypes.ipAddress('ipStart'),
        allowNull: true,
      },

      ipEnd: {
        ...DataTypes.ipAddress('ipEnd'),
        allowNull: true,
      },

      expiration: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      anonymousOnly: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      noUserCreation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      reason: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
    };
  }
  /**
   * Describes associations.
   * @method associate
   * @static
   */
  static associate() {}

  static getOptions() {
    return {
      timestamp: false,
      indexes: [
        {
          fields: ['ipStart'],
        },
        {
          fields: ['ipEnd'],
        },
        {
          fields: ['expiration'],
        },
      ],
    };
  }

  static async isBlockedIp(ipAddress) {
    const buffer = ip.toBuffer(ipAddress);
    const blocks = await this.findAll({
      where: {
        ipStart: {
          [Op.lte]: buffer,
        },
        ipEnd: {
          [Op.gte]: buffer,
        },
        expiration: {
          [Op.or]: [
            {
              [Op.gt]: Date.now(),
            },
            {
              [Op.eq]: null,
            },
          ],
        },
      },
    });
    if (blocks.length) {
      const options = {
        anonymousOnly: true,
        noUserCreation: false,
      };
      for (const block of blocks) {
        if (!block.anonymousOnly) {
          options.anonymousOnly = false;
        }
        if (block.noUserCreation) {
          options.noUserCreation = true;
        }
      }
      return options;
    }
    return false;
  }
}

module.exports = Block;
