'use strict';

const work = require('../work');
const ParsingData = require('../ParsingData');

const makeDefaultParsingData = () => new ParsingData({});

class LibertyParser {
  // eslint-disable-next-line class-methods-use-this
  parseRender({ wikitext, parsingData = makeDefaultParsingData() }) {
    return work(wikitext, parsingData);
  }
}

module.exports = LibertyParser;
