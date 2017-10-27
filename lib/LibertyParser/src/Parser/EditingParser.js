'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');
const { libertyParserSupporter } = require('../parserSupporter');
const Setting = require('../../../models/Setting');

class EditingParser extends LibertyParser {
  parseRender({ article, wikitext }) {
    const parsingData = new ParsingData(article, {
      WIKI_NAME: Setting.get('wikiName'),
      DOMAIN: Setting.get('domain'),
      LIBERTY_VERSION: global.LIBERTY_VERSION,
    }, libertyParserSupporter);
    return super.parseRender({ wikitext, parsingData });
  }
}

module.exports = EditingParser;
