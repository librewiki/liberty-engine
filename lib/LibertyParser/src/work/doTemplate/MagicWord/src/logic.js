'use strict';

const MagicWord = require('../');

module.exports = {
  '#if': new MagicWord(
    '#if',
    true,
    (
      parsingData,
      [testString = '', ifNotEmpty = '', ifEmpty = ''],
    ) => {
      if (testString) {
        return ifNotEmpty;
      }
      return ifEmpty;
    },
  ),

  '#ifeq': new MagicWord(
    '#ifeq',
    true,
    (
      parsingData,
      [str1 = '', str2 = '', ifSame = '', ifDifferent = ''],
    ) => {
      if (str1 === str2) {
        return ifSame;
      }
      return ifDifferent;
    },
  ),

  /* escape = sign in {{#switch}} */
  '=': new MagicWord('=', false, () => '\\='),

  '#switch': new MagicWord(
    '#switch',
    true,
    (
      parsingData,
      [comp = '', ...cases],
    ) => {
      let matched = false;
      let defaultValue = '';
      for (let i = 0; i < cases.length; i += 1) {
        // spilt with "=" ("\": escape character)
        let [key, ...rest] = cases[i].length ? cases[i].match(/(\\.|[^=])+/ug) : [''];
        const value = rest.join('=').trim();
        key = key.trim();
        if (key === '#default') {
          defaultValue = value;
        } else {
          if (comp === key) {
            matched = true;
          }

          if (value.length && matched) {
            return value;
          }

          if (i === cases.length - 1 && !value.length) {
            defaultValue = key;
          }
        }
      }
      return defaultValue;
    },
  ),
};
