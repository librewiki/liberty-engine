'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');
const { libertyParserSupporter } = require('../parserSupporter');
const Setting = require('../../../models/Setting');

const makeDefaultParsingData = () => new ParsingData({
  id: -1,
}, {
  WIKI_NAME: Setting.get('wikiName'),
  DOMAIN: Setting.get('domain'),
  LIBERTY_VERSION: global.LIBERTY_VERSION,
}, libertyParserSupporter);

class WikitextParser extends LibertyParser {
  parseRender({ wikitext }) {
    return super.parseRender({ wikitext, parsingData: makeDefaultParsingData() });
  }
}

module.exports = WikitextParser;
