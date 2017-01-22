'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');
const LibertyParserSupporter = require('../ParserSupporter').LibertyParserSupporter;

const defaultParsingData = new ParsingData({
  id: -1
}, {
  siteName: global.LS.site_name,
  serverDomain: global.LS.server_domain,
  libertyVersion: global.LIBERTY_VERSION
}, LibertyParserSupporter);

class WikitextParser extends LibertyParser {
  parseRender({ wikitext }) {
    return super.parseRender({ wikitext: wikitext, parsingData: defaultParsingData });
  }
}

module.exports = WikitextParser;
