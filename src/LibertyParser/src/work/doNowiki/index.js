'use strict';

const doXml = require('../doXml');

doXml.set({
  type: 'beforeParsing',
  selector: 'nowiki',
  hook: hook
});

doXml.set({
  type: 'onTemplateLoaded',
  selector: 'nowiki',
  hook: hook
});

function hook($item, parsingData) {
  let id = Math.random();
  parsingData.structureData.nowikiTexts[id] = `<nowiki>${$item.html().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</nowiki>`;
  return `\\nowiki\\_${id}_\\nowiki\\`;
}

module.exports.restore = function(wikitext, parsingData) {
  let result = wikitext.replace(/\\nowiki\\_(0\.\d+)_\\nowiki\\/g, ($0, $1) => {
    return parsingData.structureData.nowikiTexts[$1];
  });
  return Promise.resolve(result);
};
