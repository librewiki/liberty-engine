'use strict';

const LibertyTemplateTextGetter = require('./TemplateTextGetter/LibertyTemplateTextGetter');

module.exports.LibertyParserSupporter = {
  templateTextGetter: new LibertyTemplateTextGetter()
};
