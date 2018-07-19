'use strict';

const models = require('../../../models');
const cache = require('../../../cache');

module.exports = {
  async exists(fullTitle) {
    const chached = await cache.get(`article#${fullTitle}.exists`);
    if (chached === '1') {
      return true;
    }
    if (chached === '0') {
      return false;
    }
    if (await models.Article.existsWithRedirection({ fullTitle, caseSensitive: true })) {
      await cache.set(`article#${fullTitle}.exists`, '1');
      await cache.expire(`article#${fullTitle}.exists`, 100);
      return true;
    }
    await cache.set(`article#${fullTitle}.exists`, '0');
    await cache.expire(`article#${fullTitle}.exists`, 100);
    return false;
  },
  async find(fullTitle) {
    const { article } = await models.Article.findByFullTitleWithRedirection({
      fullTitle,
      caseSenstive: true,
    });
    return article;
  },
};
