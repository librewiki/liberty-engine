'use strict';


class MagicWord {
  constructor(key, needColon, func) {
    MagicWord.list.set(key, this);
    this.key = key;
    this.needColon = needColon;
    this.func = func;
    this.enabled = true;
  }

  run(parsingData, params) {
    return this.func(parsingData, params.map(p => (p ? p.trim() : p)));
  }

  static getMagicWord(fullTitle) {
    const name = fullTitle.split(':')[0].trim();

    let magicWord = this.list.get(name);
    if (magicWord && fullTitle.indexOf(':') !== -1 && magicWord.needColon && magicWord.enabled) {
      return magicWord;
    }

    magicWord = this.list.get(fullTitle);
    if (magicWord && !magicWord.needColon && magicWord.enabled) {
      return magicWord;
    }

    return null;
  }
}
MagicWord.list = new Map();
module.exports = MagicWord;
require('./src/date');
require('./src/format');
require('./src/metadata');
require('./src/logic');
require('./src/math');
require('./src/other');
