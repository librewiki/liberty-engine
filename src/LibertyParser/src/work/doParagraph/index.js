'use strict';

module.exports = function(wikitext, parsingData) {
  return Promise.resolve(`
<p>${wikitext.replace(/\n\s*\n/g, '\n</p>\n<p>\n')}</p>
`);
};
