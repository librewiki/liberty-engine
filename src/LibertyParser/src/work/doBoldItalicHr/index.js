'use strict';
module.exports = function(wikitext) {
  return Promise.resolve(
    wikitext
    .replace(/'''''(.+?)'''''/g, '<strong><em>$1</em></strong>')
    .replace(/'''(.+?)'''/g, '<strong>$1</strong>')
    .replace(/''(.+?)''/g, '<em>$1</em>')
    .replace(/^----+/gm, '<hr>')
  );
};
