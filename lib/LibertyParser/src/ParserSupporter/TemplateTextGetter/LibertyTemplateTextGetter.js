'use strict';

const TemplateTextGetter = require('./TemplateTextGetter');
const { Article } = require('../../../../models');

class LibertyTemplateTextGetter extends TemplateTextGetter {
  // @TODO redirect template
  async get(fullTitle, recursive = true) {
    const article = await Article.getByFullTitle(fullTitle);
    const revision = await article.getLatestRevision();
    const wikitext = await revision.getWikitext();
    return wikitext.text;
  }
}

module.exports = LibertyTemplateTextGetter;
