'use strict';

const ArticleParser = require('./src/Parser/ArticleParser');
const WikitextParser = require('./src/Parser/WikitextParser');

module.exports.articleParser = new ArticleParser();
module.exports.wikitextParser = new WikitextParser();
