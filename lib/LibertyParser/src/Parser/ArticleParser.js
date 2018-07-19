'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');

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
        const parsingData = new ParsingData(article);
        return super.parseRender({ wikitext: revision.wikitext.text, parsingData });
      });
  }
}

module.exports = ArticleParser;
