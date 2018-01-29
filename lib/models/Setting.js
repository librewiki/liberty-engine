'use strict';

const i18n = require('../../i18n');

const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');

const cache = new Map();
let siteNoticeHtml = null;

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
    const siteNoticeWikitext = cache.get('siteNoticeWikitext');
    if (siteNoticeWikitext) {
      this.setSiteNoticeCache(siteNoticeWikitext);
    }
  }

  static get(key) {
    return cache.get(key) || null;
  }

  static async set(key, value) {
    await this.upsert({ key, value: JSON.stringify(value) });
    cache.set(key, JSON.parse(JSON.stringify(value)));
    if (key === 'siteNoticeWikitext') await this.setSiteNoticeCache(value);
    if (key === 'language') this.setLanguage(value);
  }

  static async delete(key) {
    await this.destroy(key);
    cache.delete(key);
  }

  static async setSiteNoticeCache(wikitext) {
    const WikitextParser = require('../LibertyParser/src/Parser/WikitextParser');
    const parser = new WikitextParser();
    const renderResult = await parser.parseRender({ wikitext });
    siteNoticeHtml = renderResult.html;
  }

  static async getSiteNoticeHtml() {
    if (!siteNoticeHtml) {
      const noticeWikitext = this.get('siteNoticeWikitext');
      if (noticeWikitext) {
        await this.setSiteNoticeCache(noticeWikitext);
      } else {
        return null;
      }
    }
    return siteNoticeHtml;
  }

  static setLanguage() {
    // i18next gets a callback, but I didn't pass it for performance reasons.
    i18n.changeLanguage(this.get('language') || 'en');
  }
}

module.exports = Setting;
