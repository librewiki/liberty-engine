'use strict';

const DocumentParser = require('./src/Parser/DocumentParser');
const WikitextParser = require('./src/Parser/WikitextParser');

module.exports.documentParser = new DocumentParser();
module.exports.wikitextParser = new WikitextParser();
