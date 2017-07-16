'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');
const LibertyParserSupporter = require('../ParserSupporter').LibertyParserSupporter;
const settings = require('../../../../config/settings.json');

class EditingParser extends LibertyParser {
  parseRender({ article, wikitext }) {
    const parsingData = new ParsingData(article, {
      WIKI_NAME: settings.WIKI_NAME,
      DOMAIN: settings.DOMAIN,
      LIBERTY_VERSION: global.LIBERTY_VERSION,
    }, LibertyParserSupporter);
    return super.parseRender({ wikitext, parsingData });
  }
}

module.exports = EditingParser;
