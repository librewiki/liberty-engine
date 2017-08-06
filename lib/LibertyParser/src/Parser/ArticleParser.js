'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');
const LibertyParserSupporter = require('../ParserSupporter').LibertyParserSupporter;
const Setting = require('../../../models/Setting');

const wikiMetadata = {
  WIKI_NAME: Setting.get('wikiName'),
  DOMAIN: Setting.get('domain'),
  LIBERTY_VERSION: global.LIBERTY_VERSION,
};

class ArticleParser extends LibertyParser {
  parseRender({ article, revision }) {
    return Promise.resolve()
      .then(() => {
        if (revision) {
          return revision;
        }
        return article.getLatestRevision({ includeWikitext: true });
      })
      .then((revision) => {
        const parsingData = new ParsingData(article, wikiMetadata, LibertyParserSupporter);
        return super.parseRender({ wikitext: revision.wikitext.text, parsingData });
      });
  }
}

module.exports = ArticleParser;
