'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');
const LibertyParserSupporter = require('../ParserSupporter').LibertyParserSupporter;
const settings = require('../../../../config/settings.json');

const wikiMetadata = {
  WIKI_NAME: settings.WIKI_NAME,
  DOMAIN: settings.DOMAIN,
  LIBERTY_VERSION: global.LIBERTY_VERSION
};

class ArticleParser extends LibertyParser {
  parseRender({ article, revision }) {
    return Promise.resolve()
    .then(() => {
      if (revision) {
        return revision;
      } else {
        return article.getLatestRevision({ includeWikitext: true });
      }
    })
    .then((revision) => {
      let parsingData = new ParsingData(article, wikiMetadata, LibertyParserSupporter);
      return super.parseRender({ wikitext: revision.wikitext.text, parsingData: parsingData});
    });
  }
}

module.exports = ArticleParser;
