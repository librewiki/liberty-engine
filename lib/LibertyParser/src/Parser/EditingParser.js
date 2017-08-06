'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');
const LibertyParserSupporter = require('../ParserSupporter').LibertyParserSupporter;
const Setting = require('../../../models/Setting');

class EditingParser extends LibertyParser {
  parseRender({ article, wikitext }) {
    const parsingData = new ParsingData(article, {
      WIKI_NAME: Setting.get('wikiName'),
      DOMAIN: Setting.get('domain'),
      LIBERTY_VERSION: global.LIBERTY_VERSION,
    }, LibertyParserSupporter);
    return super.parseRender({ wikitext, parsingData });
  }
}

module.exports = EditingParser;
