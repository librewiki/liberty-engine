'use strict';

const models = require('../../models');
const { libertyParserHelper } = require('./parserHelper');

class ParsingData {
  /**
   * constructor
   *
   * @param  {Object} articleMetadata
   * @param  {Object} wikiMetadata
   * @return {DataForParsing}
   */
  constructor(
    articleMetadata,
    parserHelper = libertyParserHelper,
    wikiMetadata = ParsingData.getWikiMetaData(),
  ) {
    this.articleMetadata = articleMetadata;
    this.wikiMetadata = wikiMetadata;
    this.parserHelper = parserHelper;
    this.structureData = {
      nowikiTexts: [],
      section: {
        title: '(root)',
        relativeLevel: -1,
        absoluteLevel: -1,
        subsections: [],
      },
      tocSerialNumber: 0,
      numOfHeadings: 0,
      link: {
        articles: new Set(),
        files: new Set(),
        templates: new Set(),
        interwikis: new Set(),
        categories: new Set(),
      },
      numOfExternalLinks: 0,
      templateRecursionNumber: 0,
    };
  }

  static getWikiMetaData() {
    return {
      WIKI_NAME: models.Setting.get('wikiName'),
      DOMAIN: models.Setting.get('domain'),
      LIBERTY_VERSION: global.LIBERTY_VERSION,
      KnownNamespaces: models.Namespace.Known,
    };
  }
}

module.exports = ParsingData;
