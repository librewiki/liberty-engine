'use strict';

const TemplateTextGetter = require('./TemplateTextGetter');
const WikiDocument = require(global.moduledir + '/WikiDocument');

class LibertyTemplateTextGetter extends TemplateTextGetter {
  get(fullTitle, recursive = true) {
    return WikiDocument.getByFullTitle(fullTitle)
    .then((wikiDocument) => wikiDocument.getVersion())
    .then((version) => {
      let redirect = version.getRedirectingDestination();
      if (redirect && recursive) {
        return this.get(redirect, false);
      } else {
        return version.wikitext;
      }
    });
  }
}

module.exports = LibertyTemplateTextGetter;
