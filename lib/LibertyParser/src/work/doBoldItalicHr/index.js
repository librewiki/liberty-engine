'use strict';

module.exports = async wikitext => wikitext
  .replace(/'''''(.+?)'''''/ug, '<strong><em>$1</em></strong>')
  .replace(/'''(.+?)'''/ug, '<strong>$1</strong>')
  .replace(/''(.+?)''/ug, '<em>$1</em>')
  .replace(/^----+/ugm, '<hr>');
