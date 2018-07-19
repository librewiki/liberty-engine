'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');

const makeDefaultParsingData = () => new ParsingData({ id: -1 });

class WikitextParser extends LibertyParser {
  parseRender({ wikitext }) {
    return super.parseRender({ wikitext, parsingData: makeDefaultParsingData() });
  }
}

module.exports = WikitextParser;
