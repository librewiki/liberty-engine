'use strict';

const MagicWord = require('../');

new MagicWord('lc', true, (parsingData, [str = '']) => {
  return str.toLowerCase();
});
new MagicWord('uc', true, (parsingData, [str = '']) => {
  return str.toUpperCase();
});
new MagicWord('lcfirst', true, (parsingData, [str = '']) => {
  return str[0].toLowerCase() + str.splice(1);
});
new MagicWord('ucfirst', true, (parsingData, [str = '']) => {
  return str[0].toUpperCase() + str.splice(1);
});
