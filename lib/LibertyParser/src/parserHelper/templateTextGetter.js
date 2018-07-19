'use strict';

const models = require('../../../models');

const cache = require('../../../cache');

module.exports = {
  async get(fullTitle) {
    const chached = await cache.get(`template-wikitext#${fullTitle}`);
    if (chached) {
      return chached;
    }
    let result = `[[${fullTitle}]]`;
    const { article } = await models.Article.findByFullTitleWithRedirection({
      fullTitle,
      caseSenstive: true,
    });
    if (article) {
      const revision = await article.getLatestRevision({ includeWikitext: true });
      result = revision.wikitext.text;
    }
    await cache.set(`template-wikitext#${fullTitle}`, result);
    await cache.expire(`template-wikitext#${fullTitle}`, 100);
    return result;
  },
};
