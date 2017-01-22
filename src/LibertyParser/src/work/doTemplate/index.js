'use strict';
const Parser = require('./parser.js').Parser;
const ArrayMap = require(global.moduledir + '/utilities').ArrayMap;

module.exports = function(wikitext, parsingData, option = { templateRecursionNumber: 0, templateParams: new ArrayMap() }) {
  let parsed = parser.parse(wikitext);
  return parsed.render(parsingData, option);
};

const Nodes = require('./Nodes/NodeList.js').default;
const parser = new Parser();
parser.yy = {
  Nodes: Nodes,
};
