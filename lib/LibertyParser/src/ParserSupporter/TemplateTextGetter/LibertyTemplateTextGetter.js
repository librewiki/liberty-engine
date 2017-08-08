'use strict';

const TemplateTextGetter = require('./TemplateTextGetter');
const models = require('../../../../models');

class LibertyTemplateTextGetter extends TemplateTextGetter {
  // @TODO redirect template
  async get(fullTitle, recursive = true) {
    const article = await models.Article.findByFullTitle(fullTitle);
    if (!article) {
      return `[[${fullTitle}]]`;
    }
    const revision = await article.getLatestRevision();
    const wikitext = await revision.getWikitext();
    return wikitext.text;
  }
}

module.exports = LibertyTemplateTextGetter;
