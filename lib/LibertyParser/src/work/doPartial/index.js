'use strict';

const doXml = require('../doXml');
const cheerio = require('cheerio');

doXml.set({
  type: 'beforeParsing',
  selector: 'includeonly',
  hook: () => '',
});

// should run after processing onlyinclude
doXml.set({
  type: 'onTemplateLoaded',
  selector: 'includeonly',
  hook: $item => $item.text(),
});

doXml.set({
  type: 'onTemplateLoaded',
  selector: 'noinclude',
  hook: () => '',
});

module.exports.onlyinclude = (wikitext) => {
  const $ = cheerio.load(wikitext, { decodeEntities: false, recognizeSelfClosing: true });
  let result = '';
  $('onlyinclude').each(function a() {
    result += $(this).html();
  });
  return result || wikitext;
};
