'use strict';

const MagicWord = require('../');

new MagicWord('SITENAME', false, (parsingData, params) => {
  return parsingData.wikiMetadata.SITE_NAME;
});

new MagicWord('SERVER', false, (parsingData, params) => {
  return parsingData.wikiMetadata.DOMAIN;
});

new MagicWord('SERVERNAME', false, (parsingData, params) => {
  return parsingData.wikiMetadata.DOMAIN;
});

new MagicWord('CURRENTVERSION', false, (parsingData, params) => {
  return parsingData.wikiMetadata.LIBERTY_VERSION;
});

new MagicWord('PAGEID', false, (parsingData, params) => {
  return String(parsingData.articleMetadata.id);
});

new MagicWord('ARTICLEID', false, (parsingData, params) => {
  return String(parsingData.articleMetadata.id);
});
