'use strict';

class ParsingData {
  /**
   * constructor
   *
   * @param  {Object} articleMetadata
   * @param  {Object} wikiMetadata
   * @return {DataForParsing}
   */
  constructor(articleMetadata, wikiMetadata, parserSupporter) {
    this.articleMetadata = articleMetadata;
    this.wikiMetadata = wikiMetadata;
    this.parserSupporter = parserSupporter;
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
        categories: new Set(),
        normals: new Set(),
        files: new Set(),
        templates: new Set(),
        interwikis: new Set(),
      },
      numOfExternalLinks: 0,
      templateRecursionNumber: 0,
    };
  }
}

module.exports = ParsingData;
