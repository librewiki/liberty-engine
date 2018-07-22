'use strict';

const MagicWord = require('../');

module.exports = {
  lc: new MagicWord('lc', true, (parsingData, [str = '']) => str.toLowerCase()),
  uc: new MagicWord('uc', true, (parsingData, [str = '']) => str.toUpperCase()),
  lcfirst: new MagicWord('lcfirst', true, (parsingData, [str = '']) => str.charAt(0).toLowerCase() + str.slice(1)),
  ucfirst: new MagicWord('ucfirst', true, (parsingData, [str = '']) => str.charAt(0).toUpperCase() + str.slice(1)),
};
