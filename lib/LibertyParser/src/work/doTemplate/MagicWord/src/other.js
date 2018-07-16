'use strict';

const MagicWord = require('../');

module.exports = {
  '!': new MagicWord('!', false, () => '|'),

  /* {{#tag:tagname|content|attribute1=value1|attribute2=value2}} */
  '#tag': new MagicWord(
    '#tag',
    true,
    (
      parsingData,
      [tagName = '', content = '', ...attributes],
    ) => {
      const attrs = [];
      for (let i = 0; i < attributes.length; i += 1) {
        const t = attributes[i].split('=');
        const name = t[0].trim();
        if (name.indexOf(' ') === -1) {
          const val = t.slice(1).join('=');
          attrs.push([name, val]);
        }
      }
      const attrText = attrs.map(([name, val]) => `${name}=${val}`).join(' ');
      return `<${tagName} ${attrText}>${content}</${tagName}>`;
    },
  ),
};
