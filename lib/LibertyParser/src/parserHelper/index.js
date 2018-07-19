'use strict';

const templateTextGetter = require('./templateTextGetter');
const articleHelper = require('./articleHelper');
const splitFullTitle = require('./splitFullTitle');
const joinNamespaceIdTitle = require('./joinNamespaceIdTitle');

module.exports.libertyParserHelper = {
  templateTextGetter,
  articleHelper,
  splitFullTitle,
  joinNamespaceIdTitle,
};
