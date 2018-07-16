'use strict';

const { Parser } = require('./parser.js');
const ArrayMap = require('../../../../utils/ArrayMap');

// eslint-disable-next-line no-use-before-define
module.exports = doTemplate;

const Nodes = require('./Nodes/NodeList.js').default;

const parser = new Parser();
parser.yy = {
  Nodes,
};

async function doTemplate(
  wikitext,
  parsingData,
  option = { templateRecursionNumber: 0, templateParams: new ArrayMap() },
) {
  const parsed = parser.parse(wikitext);
  return parsed.render(parsingData, option);
}
