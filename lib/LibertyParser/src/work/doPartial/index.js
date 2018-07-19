'use strict';

const cheerio = require('cheerio');
const doXml = require('../doXml');

doXml.set({
  type: 'beforeParsing',
  selector: 'includeonly',
  hook: () => '',
});

doXml.set({
  type: 'beforeParsing',
  selector: 'onlyinclude',
  hook: $item => $item.text(),
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
  const $ = cheerio.load(wikitext, {
    xmlMode: true,
    decodeEntities: false,
    recognizeSelfClosing: true,
  });
  let result = '';
  $('onlyinclude').each(function a() {
    result += $(this).html();
  });
  return result || wikitext;
};
