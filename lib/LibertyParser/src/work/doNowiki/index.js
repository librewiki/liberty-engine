'use strict';

const katex = require('katex');
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

function mathHook($item, parsingData) {
  const id = Math.random();
  parsingData.structureData.nowikiTexts[id] = $item.html();
  return `\\nowiki_math\\_${id}_\\nowiki_math\\`;
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
  type: 'beforeParsing',
  selector: 'math',
  hook: mathHook,
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

doXml.set({
  type: 'onTemplateLoaded',
  selector: 'math',
  hook: mathHook,
});

module.exports.restore = async (wikitext, parsingData) => {
  const result = wikitext.replace(
    /\\nowiki\\_(0\.\d+)_\\nowiki\\/ug,
    ($0, $1) => parsingData.structureData.nowikiTexts[$1],
  );
  return result;
};

module.exports.restoreMath = async (wikitext, parsingData) => {
  const result = wikitext.replace(
    /\\nowiki_math\\_(0\.\d+)_\\nowiki_math\\/ug,
    ($0, $1) => {
      const mathText = parsingData.structureData.nowikiTexts[$1];
      let rendered;
      try {
        rendered = katex.renderToString(mathText, { throwOnError: false });
      } catch (err) {
        rendered = '<code>KaTeX Error</code>';
      }
      return rendered;
    },
  );
  return result;
};
