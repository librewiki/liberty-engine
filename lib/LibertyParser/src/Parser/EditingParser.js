'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');

class EditingParser extends LibertyParser {
  parseRender({ article, wikitext }) {
    const parsingData = new ParsingData(article);
    return super.parseRender({ wikitext, parsingData });
  }
}

module.exports = EditingParser;
