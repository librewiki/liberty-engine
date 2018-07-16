'use strict';

const { minify } = require('html-minifier');
const doHeading = require('./doHeading');
const doLink = require('./doLink');
const doTable = require('./doTable');
const doParagraph = require('./doParagraph');
const doBoldItalicHr = require('./doBoldItalicHr');
const doList = require('./doList');
const doXml = require('./doXml');
const doNowiki = require('./doNowiki');
const doTableOfContents = require('./doTableOfContents');
const doTemplate = require('./doTemplate');
const doSanitize = require('./doSanitize');
require('./doPartial');

module.exports = async (wikitext, parsingData) => {
  console.time('prepare');
  let intermediate = `\n${wikitext.trim().replace(/\r\n|\r/ug, '\n')}\n`;
  intermediate = await doXml('beforeParsing', intermediate, parsingData);
  intermediate = await doXml('afterNowiki', intermediate, parsingData);
  console.timeEnd('prepare');
  console.time('template');
  intermediate = await doTemplate(intermediate, parsingData);
  console.timeEnd('template');
  console.time('heading');
  intermediate = await doHeading(intermediate, parsingData);
  console.timeEnd('heading');
  console.time('TOC');
  intermediate = await doTableOfContents(intermediate, parsingData);
  console.timeEnd('TOC');
  console.time('Link');
  intermediate = await doLink(intermediate, parsingData);
  console.timeEnd('Link');
  console.time('Table');
  intermediate = await doTable(intermediate, parsingData);
  console.timeEnd('Table');
  console.time('paragraph');
  intermediate = await doParagraph(intermediate, parsingData);
  console.timeEnd('paragraph');
  console.time('BoldItalicHr');
  intermediate = await doBoldItalicHr(intermediate, parsingData);
  console.timeEnd('BoldItalicHr');
  console.time('List');
  intermediate = await doList(intermediate, parsingData);
  console.timeEnd('List');
  console.time('XML');
  intermediate = await doXml('afterParsing', intermediate, parsingData);
  console.timeEnd('XML');
  console.time('restore nowiki');
  intermediate = await doNowiki.restore(intermediate, parsingData);
  console.timeEnd('restore nowiki');
  console.time('sanitize');
  intermediate = await doSanitize(intermediate, parsingData);
  console.timeEnd('sanitize');
  console.time('xml after sanitize');
  intermediate = await doXml('afterSanitize', intermediate, parsingData);
  console.timeEnd('xml after sanitize');
  console.time('restore math');
  intermediate = await doNowiki.restoreMath(intermediate, parsingData);
  console.timeEnd('restore math');
  console.time('minify');
  const html = minify(intermediate.trim());
  console.timeEnd('minify');
  return {
    html,
    fullTitle: parsingData.articleMetadata.fullTitle,
    link: parsingData.structureData.link,
  };
};
