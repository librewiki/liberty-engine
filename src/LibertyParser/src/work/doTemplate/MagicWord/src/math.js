'use strict';

const MagicWord = require('../');
const math = require('mathjs');

new MagicWord('#expr', true, (parsingData, [expression = '']) => {
  try {
    return math.eval(expression);
  } catch (e) {
    return `<span class="error"> ${e} </span>`;
  }
});
new MagicWord('#ifexpr', true, (parsingData,
  [expression = '', ifTrue = '', ifFalse = '']) => {
  try {
    if (math.eval(expression)) {
      return ifTrue;
    }
    return ifFalse;
  } catch (e) {
    return `<span class="error"> ${e} </span>`;
  }
});
