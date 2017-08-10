'use strict';

const doXml = require('../doXml');

function nowikiHook($item, parsingData) {
  const id = Math.random();
  parsingData.structureData.nowikiTexts[id] = $item.html().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `\\nowiki\\_${id}_\\nowiki\\`;
}

function preHook($item, parsingData) {
  const id = Math.random();
  parsingData.structureData.nowikiTexts[id] = `<pre>${$item.html().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
  return `\\nowiki\\_${id}_\\nowiki\\`;
}

doXml.set({
  type: 'beforeParsing',
  selector: 'pre',
  hook: preHook,
});

doXml.set({
  type: 'beforeParsing',
  selector: 'nowiki',
  hook: nowikiHook,
});

doXml.set({
  type: 'onTemplateLoaded',
  selector: 'pre',
  hook: preHook,
});

doXml.set({
  type: 'onTemplateLoaded',
  selector: 'nowiki',
  hook: nowikiHook,
});


module.exports.restore = (wikitext, parsingData) => {
  const result = wikitext.replace(/\\nowiki\\_(0\.\d+)_\\nowiki\\/ug,
    ($0, $1) => parsingData.structureData.nowikiTexts[$1]
  );
  return Promise.resolve(result);
};
