'use strict';

const work = require('../work');
const ParsingData = require('../ParsingData');
const { libertyParserSupporter } = require('../parserSupporter');
const Setting = require('../../../models/Setting');

const makeDefaultParsingData = () => new ParsingData({}, {
  WIKI_NAME: Setting.get('wikiName'),
  DOMAIN: Setting.get('domain'),
  LIBERTY_VERSION: global.LIBERTY_VERSION,
}, libertyParserSupporter);

class LibertyParser {
  parseRender({ wikitext, parsingData = makeDefaultParsingData() }) {
    return work(wikitext, parsingData);
  }
}

module.exports = LibertyParser;
