'use strict';

const MagicWord = require('../');

new MagicWord('SITENAME', false, (parsingData, params) => {
  return parsingData.wikiMetadata.siteName;
});

new MagicWord('SERVER', false, (parsingData, params) => {
  return parsingData.wikiMetadata.serverDomain;
});

new MagicWord('SERVERNAME', false, (parsingData, params) => {
  return parsingData.wikiMetadata.serverDomain;
});

new MagicWord('CURRENTVERSION', false, (parsingData, params) => {
  return parsingData.wikiMetadata.libertyVersion;
});

new MagicWord('PAGEID', false, (parsingData, params) => {
  return String(parsingData.documentMetadata.id);
});
