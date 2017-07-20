'use strict';

const doXml = require('../doXml');
const cheerio = require('cheerio');

function includeonlyHook($item, parsingData) {
  return '';
}

doXml.set({
  type: 'beforeParsing',
  selector: 'includeonly',
  hook: includeonlyHook,
});


module.exports.onlyinclude = (wikitext) => {
  const $ = cheerio.load(wikitext, { decodeEntities: false, recognizeSelfClosing: true });
  let result = '';
  $('onlyinclude').each(function a() {
    result += $(this).html();
  });
  return result || wikitext;
};

function noincludeHook($item, parsingData) {
  return '';
}

// should run after processing onlyinclude
doXml.set({
  type: 'onTemplateLoaded',
  selector: 'noinclude',
  hook: noincludeHook,
});
