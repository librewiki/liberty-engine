'use strict';

const TemplateTextGetter = require('./TemplateTextGetter');
const models = require('../../../../models');

const cache = require('../../../../cache');

cache.set('asdf', 1);

class LibertyTemplateTextGetter extends TemplateTextGetter {
  // @TODO redirect template
  async get(fullTitle, recursive = true) {
    const chached = await cache.get(`template-wikitext#${fullTitle}`);
    if (chached) {
      return chached;
    }
    let result = `[[${fullTitle}]]`;
    const article = await models.Article.findByFullTitle(fullTitle);
    if (article) {
      const revision = await article.getLatestRevision();
      const wikitext = await revision.getWikitext();
      result = wikitext.text;
    }
    await cache.set(`template-wikitext#${fullTitle}`, result);
    await cache.expire(`template-wikitext#${fullTitle}`, 100);
    return result;
  }
}

module.exports = LibertyTemplateTextGetter;
