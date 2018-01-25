'use strict';

const hjs = require('highlight.js');

function hook($item, parsingData) {
  const id = Math.random();
  let rendered = '';
  try {
    const lang = $item.attr('lang');
    const text = $item.text();
    if (lang) {
      rendered = `<pre class="syntax-highlight"><code class="hljs">${hjs.highlight(lang, text, true).value.trim()}</code></pre>`;
    } else {
      rendered = '<code>syntax-highlight error: "lang" is required.</code>';
    }
  } catch (err) {
    rendered = '<code>syntax-highlight error</code>';
  }
  parsingData.structureData.nowikiTexts[id] = rendered;
  return `\\nowiki\\_${id}_\\nowiki\\`;
}

module.exports.import = (helper) => {
  helper.parserHook.setXmlHook({
    type: 'beforeParsing',
    selector: 'source',
    hook,
  });
};
