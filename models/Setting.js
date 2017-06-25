'use strict';

const Sequelize = require('sequelize');
const LibertyModel = require('./LibertyModel');

const cache = new Map();

class Setting extends LibertyModel {
  static init(sequelize) {
    super.init({
      key: {
        type: Sequelize.STRING(120),
        primaryKey: true,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'setting',
    });
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
