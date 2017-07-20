'use strict';

const doXml = require('../doXml');

function hook($item, parsingData) {
  const id = Math.random();
  parsingData.structureData.nowikiTexts[id] = `<nowiki>${$item.html().replace(/</ug, '&lt;').replace(/>/ug, '&gt;')}</nowiki>`;
  return `\\nowiki\\_${id}_\\nowiki\\`;
}

doXml.set({
  type: 'beforeParsing',
  selector: 'nowiki',
  hook,
});

doXml.set({
  type: 'onTemplateLoaded',
  selector: 'nowiki',
  hook,
});

module.exports.restore = (wikitext, parsingData) => {
  const result = wikitext.replace(/\\nowiki\\_(0\.\d+)_\\nowiki\\/ug, ($0, $1) => parsingData.structureData.nowikiTexts[$1]);
  return Promise.resolve(result);
};
