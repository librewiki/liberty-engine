'use strict';

const MagicWord = require('../');

module.eports = {
  SITENAME: new MagicWord('SITENAME', false, (parsingData, params) => parsingData.wikiMetadata.WIKI_NAME),

  SERVER: new MagicWord('SERVER', false, (parsingData, params) => parsingData.wikiMetadata.DOMAIN),

  SERVERNAME: new MagicWord('SERVERNAME', false, (parsingData, params) => parsingData.wikiMetadata.DOMAIN),

  CURRENTVERSION: new MagicWord('CURRENTVERSION', false, (parsingData, params) => parsingData.wikiMetadata.LIBERTY_VERSION),

  PAGEID: new MagicWord('PAGEID', false, (parsingData, params) => String(parsingData.articleMetadata.id)),

  ARTICLEID: new MagicWord('ARTICLEID', false, (parsingData, params) => String(parsingData.articleMetadata.id)),
};
