'use strict';

const Parser = require('./parser.js').Parser;
const ArrayMap = require('../../../../utils/ArrayMap');

module.exports = (
  wikitext, parsingData, option = { templateRecursionNumber: 0, templateParams: new ArrayMap() }
) => {
  const parsed = parser.parse(wikitext);
  return parsed.render(parsingData, option);
};

const Nodes = require('./Nodes/NodeList.js').default;

const parser = new Parser();
parser.yy = {
  Nodes,
};
