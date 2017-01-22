'use strict';

const work = require('../work');
const ParsingData = require('../ParsingData');
const LibertyParserSupporter = require('../ParserSupporter').LibertyParserSupporter;

const defaultParsingData = new ParsingData({}, {
  siteName: global.LS.site_name,
  serverDomain: global.LS.server_domain,
  libertyVersion: global.LIBERTY_VERSION
}, LibertyParserSupporter);

class LibertyParser {
  constructor() {}
  parseRender({ wikitext, parsingData = defaultParsingData }) {
    return work(wikitext, parsingData);
  }
}

module.exports = LibertyParser;
