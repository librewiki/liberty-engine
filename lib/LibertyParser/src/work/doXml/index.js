'use strict';

const cheerio = require('cheerio');

const parserHookMap = {
  beforeParsing: new Map(),
  onTemplateLoaded: new Map(),
  afterNowiki: new Map(),
  afterParsing: new Map(),
  afterSanitize: new Map(),
};

module.exports = async (type, wikitext, parsingData) => {
  const $ = cheerio.load(wikitext, {
    xmlMode: true,
    decodeEntities: false,
    recognizeSelfClosing: true,
  });
  const promises = [];
  const parserHooks = parserHookMap[type];
  for (const [selector, hookFunction] of parserHooks) {
    const $items = $(selector);
    promises.push(
      Promise
        .all($items.toArray().map($item => hookFunction($($item), parsingData)))
        .then((results) => {
          $items.replaceWith(i => results[i]);
        }),
    );
  }
  await Promise.all(promises);
  return $.html();
};

/**
 * @param {number} type
 * @param {string} selector
 * @param {function} hook
 */
module.exports.set = ({ type, selector, hook }) => parserHookMap[type].set(selector, hook);
