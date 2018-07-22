'use strict';

const MagicWord = require('../');

module.exports = {
  SITENAME: new MagicWord('SITENAME', false, parsingData => parsingData.wikiMetadata.WIKI_NAME),

  SERVER: new MagicWord('SERVER', false, parsingData => parsingData.wikiMetadata.DOMAIN),

  SERVERNAME: new MagicWord('SERVERNAME', false, parsingData => parsingData.wikiMetadata.DOMAIN),

  CURRENTVERSION: new MagicWord('CURRENTVERSION', false, parsingData => parsingData.wikiMetadata.LIBERTY_VERSION),

  PAGEID: new MagicWord('PAGEID', false, parsingData => String(parsingData.articleMetadata.id)),

  ARTICLEID: new MagicWord('ARTICLEID', false, parsingData => String(parsingData.articleMetadata.id)),

  FULLPAGENAME: new MagicWord('PAGENAME', false, parsingData => parsingData.articleMetadata.fullTitle),

  PAGENAME: new MagicWord('PAGENAME', false, parsingData => parsingData.articleMetadata.title),
};
