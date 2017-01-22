'use strict';

const cheerio = require('cheerio');

const parserHookMap = {
  beforeParsing: new Map(),
  onTemplateLoaded: new Map(),
  afterNowiki: new Map(),
  afterParsing: new Map()
};


module.exports = function(type, wikitext, parsingData) {
  let $ = cheerio.load(wikitext, { decodeEntities: false, recognizeSelfClosing: true });
  let promises = [];
  for (let [selector, hookFunction] of parserHookMap[type]) {
    let $items = $(selector);
    promises.push(
      Promise
      .all($items.toArray().map(($item) => hookFunction($($item), parsingData)))
      .then((results) => {
        $items.replaceWith((i) => results[i]);
      })
    );
  }
  return Promise.all(promises).then(() => $.html());
};

/**
 * @param {number} type
 * @param {string} selector
 * @param {function} hook
 */
module.exports.set = function({ type, selector, hook }) {
  return parserHookMap[type].set(selector, hook);
};
