'use strict';

module.exports = async wikitext => `
<p>${wikitext.replace(/\n\s*\n/ug, '\n</p>\n<p>\n')}</p>
`;
