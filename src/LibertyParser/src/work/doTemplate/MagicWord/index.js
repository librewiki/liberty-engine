'use strict';


class MagicWord {
  constructor(key, needColon, func) {
    list.set(key, this);
    this.key = key;
    this.needColon = needColon;
    this.func = func;
    this.enabled = true;
  }

  run(parsingData, params) {
    return this.func(parsingData, params.map(p => p ? p.trim() : p)) ;
  }

  static getMagicWord(fullTitle) {
    let splited = fullTitle.split(':')[0].trim();
    if (list.get(splited) && fullTitle.indexOf(':') !== -1 && list.get(splited).needColon && list.get(splited).enabled) {
      return list.get(splited);
    } else if (list.get(fullTitle) && !list.get(fullTitle).needColon && list.get(fullTitle).enabled) {
      return list.get(fullTitle);
    } else {
      return null;
    }
  }
}
const list = MagicWord.list = new Map();
module.exports = MagicWord;
require('./src/date');
require('./src/format');
require('./src/metadata');
require('./src/logic');
require('./src/math');
require('./src/other');
