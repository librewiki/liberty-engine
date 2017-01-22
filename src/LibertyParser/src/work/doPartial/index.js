'use strict';

const doXml = require('../doXml');
const cheerio = require('cheerio');

doXml.set({
  type: 'beforeParsing',
  selector: 'includeonly',
  hook: includeonlyHook
});

function includeonlyHook($item, parsingData) {
  return '';
}


module.exports.onlyinclude = function(wikitext, parsingData) {
  let $ = cheerio.load(wikitext, { decodeEntities: false, recognizeSelfClosing: true });
  let result = '';
  $('onlyinclude').each(function() {
    result += $(this).html();
  });
  return result || wikitext;
};

// should run after processing onlyinclude
doXml.set({
  type: 'onTemplateLoaded',
  selector: 'noinclude',
  hook: noincludeHook
});

function noincludeHook($item, parsingData) {
  return '';
}
