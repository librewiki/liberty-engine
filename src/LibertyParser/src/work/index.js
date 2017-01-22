'use strict';

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
module.exports = function(wikitext, parsingData) {
  return Promise.resolve('\n' + wikitext.trim().replace(/\r\n|\r/g, '\n') + '\n')
  .then((intermediate) => doXml('beforeParsing', intermediate, parsingData))
  .then((intermediate) => doXml('afterNowiki', intermediate, parsingData))
  .then((intermediate) => doTemplate(intermediate, parsingData))
  .then((intermediate) => doParagraph(intermediate, parsingData))
  .then((intermediate) => doHeading(intermediate, parsingData))
  .then((intermediate) => doTableOfContents(intermediate, parsingData))
  .then((intermediate) => doTable(intermediate, parsingData))
  .then((intermediate) => doLink(intermediate, parsingData))
  .then((intermediate) => doBoldItalicHr(intermediate, parsingData))
  .then((intermediate) => doList(intermediate, parsingData))
  .then((intermediate) => doXml('afterParsing', intermediate, parsingData))
  .then((intermediate) => doNowiki.restore(intermediate, parsingData))
  .then((intermediate) => doSanitize(intermediate, parsingData))
  .then((intermediate) => intermediate.trim())
  .then((html) => {
    return {
      html: html,
      fullTitle: parsingData.documentMetadata.fullTitle,
      link: parsingData.structureData.link
    };
  });
};
