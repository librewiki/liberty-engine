'use strict';

const MagicWord = require('../');

new MagicWord('#if', true, (parsingData,
  [testString = '', ifNotEmpty = '', ifEmpty = '']) => {
  if (testString) {
    return ifNotEmpty;
  }
  return ifEmpty;
});

new MagicWord('#ifeq', true, (parsingData,
  [str1 = '', str2 = '', ifSame = '', ifDifferent = '']) => {
  if (str1 === str2) {
    return ifSame;
  }
  return ifDifferent;
});

/* escape = sign in {{#switch}} */
new MagicWord('=', false, () => '\\=');

new MagicWord('#switch', true, (parsingData,
  [comp = '', ...cases]) => {
  let matched = false;
  let defaultValue = '';
  for (let i = 0; i < cases.length; i++) {
    const [key, ...rest] =
    cases[i].split('').reverse().join('').split(/=(?!\\)/u)
      .map(s => s.trim().split('').reverse().join('').replace('\\=', '='))
      .reverse();
    const value = rest.join('=');
    if (key === '#default') {
      defaultValue = value;
      continue;
    }

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
  return defaultValue;
});
