'use strict';

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');

const cache = new Map();

class Setting extends LibertyModel {
  static getAttributes() {
    return {
      key: {
        type: DataTypes.STRING(120),
        primaryKey: true,
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    };
  }

  static async initialize() {
    cache.clear();
    const settings = await this.findAll();
    for (const { key, value } of settings) {
      cache.set(key, JSON.parse(value));
    }
  }

  static get(key) {
    return cache.get(key) || null;
  }

  static async set(key, value) {
    await this.upsert({ key, value: JSON.stringify(value) });
    cache.set(key, JSON.parse(JSON.stringify(value)));
  }

  static async delete(key) {
    await this.destroy(key);
    cache.delete(key);
  }
}

module.exports = Setting;
