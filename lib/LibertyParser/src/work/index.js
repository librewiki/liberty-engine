'use strict';

const { minify } = require('html-minifier');
const doHeading = require('./doHeading');
const doLink = require('./doLink');
const doTable = require('./doTable');
const doParagraph = require('./doParagraph');
const doBoldItalicHr = require('./doBoldItalicHr');
const doList = require('./doList');
const doXml = require('./doXml');
const hook = require('./hook');
const doNowiki = require('./doNowiki');
const doTableOfContents = require('./doTableOfContents');
const doTemplate = require('./doTemplate');
const doSanitize = require('./doSanitize');
require('./doPartial');

module.exports = async (wikitext, parsingData) => {
  let intermediate = `\n${wikitext.trim().replace(/\r\n|\r/ug, '\n')}\n`;
  intermediate = await doXml('beforeParsing', intermediate, parsingData);
  intermediate = await doXml('afterNowiki', intermediate, parsingData);
  intermediate = await doTemplate(intermediate, parsingData);
  intermediate = await doHeading(intermediate, parsingData);
  intermediate = await doTableOfContents(intermediate, parsingData);
  intermediate = await doLink(intermediate, parsingData);
  intermediate = await doParagraph(intermediate, parsingData);
  intermediate = await doList(intermediate, parsingData);
  intermediate = await doTable(intermediate, parsingData);
  intermediate = await doBoldItalicHr(intermediate, parsingData);
  intermediate = await doXml('afterParsing', intermediate, parsingData);
  intermediate = await hook.run({ type: 'afterParsing', intermediate, parsingData });
  intermediate = await doNowiki.restore(intermediate, parsingData);
  intermediate = await doSanitize(intermediate, parsingData);
  intermediate = await doXml('afterSanitize', intermediate, parsingData);
  intermediate = await doNowiki.restoreMath(intermediate, parsingData);
  const html = minify(intermediate.trim());
  return {
    html,
    fullTitle: parsingData.articleMetadata.fullTitle,
    link: parsingData.structureData.link,
  };
};
