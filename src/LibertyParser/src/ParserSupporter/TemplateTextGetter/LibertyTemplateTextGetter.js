'use strict';

const TemplateTextGetter = require('./TemplateTextGetter');
const { Article } = require('../../../../../models');

class LibertyTemplateTextGetter extends TemplateTextGetter {
  // @TODO redirect template
  get(fullTitle, recursive = true) {
    return Article.getByFullTitle(fullTitle)
    .then((article) => article.getLatestRevision())
    .then((revision) => {
      return revision.getWikitext();
    })
    .then((wikitext) => {
      return wikitext.text;
    });
  }
}

module.exports = LibertyTemplateTextGetter;
