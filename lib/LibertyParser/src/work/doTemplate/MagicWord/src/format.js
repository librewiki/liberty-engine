'use strict';

const MagicWord = require('../');

module.exports = {
  lc: new MagicWord('lc', true, (parsingData, [str = '']) => str.toLowerCase()),
  uc: new MagicWord('uc', true, (parsingData, [str = '']) => str.toUpperCase()),
  lcfirst: new MagicWord('lcfirst', true, (parsingData, [str = '']) => str[0].toLowerCase() + str.splice(1)),
  ucfirst: new MagicWord('ucfirst', true, (parsingData, [str = '']) => str[0].toUpperCase() + str.splice(1)),
};
