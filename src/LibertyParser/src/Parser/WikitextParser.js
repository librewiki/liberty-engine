'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');
const LibertyParserSupporter = require('../ParserSupporter').LibertyParserSupporter;
const settings = require('../../../../config/settings.json');

const defaultParsingData = new ParsingData({
  id: -1
}, {
  WIKI_NAME: settings.WIKI_NAME,
  DOMAIN: settings.DOMAIN,
  LIBERTY_VERSION: global.LIBERTY_VERSION
}, LibertyParserSupporter);

class WikitextParser extends LibertyParser {
  parseRender({ wikitext }) {
    return super.parseRender({ wikitext: wikitext, parsingData: defaultParsingData });
  }
}

module.exports = WikitextParser;
