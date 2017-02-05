'use strict';

const work = require('../work');
const ParsingData = require('../ParsingData');
const LibertyParserSupporter = require('../ParserSupporter').LibertyParserSupporter;
const settings = require('../../../../config/settings.json');

const makeDefaultParsingData = () => new ParsingData({}, {
  WIKI_NAME: settings.WIKI_NAME,
  DOMAIN: settings.DOMAIN,
  LIBERTY_VERSION: global.LIBERTY_VERSION
}, LibertyParserSupporter);

class LibertyParser {
  constructor() {}
  parseRender({ wikitext, parsingData = makeDefaultParsingData() }) {
    return work(wikitext, parsingData);
  }
}

module.exports = LibertyParser;
