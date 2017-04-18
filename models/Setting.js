/**
 * Provides Setting model.
 *
 * @module models
 * @submodule Setting
 */

'use strict';

const cache = new Map();

/**
 * Model representing wiki settings.
 *
 * @class Setting
 */
module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('setting', {
    /**
     * Owner's id. Used as primary key.
     *
     * @property userId
     * @type Number
     */
    key: {
      type: DataTypes.STRING(120),
      primaryKey: true
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    classMethods: {
      async initialize() {
        cache.clear();
        const settings = await this.findAll();
        for (const { key, value } of settings) {
          cache.setting.set(key, JSON.parse(value));
        }
      },
      get(key) {
        return cache.get(key) || null;
      },
      set(key, value) {
        cache.set(key, JSON.parse(JSON.stringify(value)));
        this.upsert({ key, value: JSON.stringify(value) });  // async
      },
      delete(key) {
        cache.delete(key);
        this.destroy(key);  // async
      }
    }
  });
  return Setting;
};
