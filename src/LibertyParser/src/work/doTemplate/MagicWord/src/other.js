'use strict';

const MagicWord = require('../');

new MagicWord('!', false, (parsingData, params) => {
  return '|';
});


/* {{#tag:tagname|content|attribute1=value1|attribute2=value2}} */
new MagicWord('#tag', true, (parsingData,
  [tagName = '', content = '', ...attributes]) => {
  let attrs = [];
  for (let i = 0; i < attributes.length; i++) {
    let t = attributes[i].split('=');
    let name = t[0].trim();
    if (name.indexOf(' ') !== -1) {
      continue;
    }
    let val = t.slice(1).join('=');
    attrs.push([name, val]);
  }
  let attrText = attrs.map(([name, val]) => name + '=' + val).join(' ');
  return `<${tagName} ${attrText}>${content}</${tagName}>`;
});
