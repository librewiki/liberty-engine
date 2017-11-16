'use strict';


class MagicWord {
  constructor(key, colonIsNeeded, func) {
    this.key = key;
    this.colonIsNeeded = colonIsNeeded;
    this.func = func;
    this.enabled = true;
  }

  run(parsingData, params) {
    return this.func(parsingData, params.map(p => (p ? p.trim() : p)));
  }

  static getMagicWord(fullTitle) {
    const name = fullTitle.split(':')[0].trim();

    let magicWord = this.list.get(name);
    if (magicWord && fullTitle.indexOf(':') !== -1 && magicWord.colonIsNeeded && magicWord.enabled) {
      return magicWord;
    }

    magicWord = this.list.get(fullTitle);
    if (magicWord && !magicWord.colonIsNeeded && magicWord.enabled) {
      return magicWord;
    }

    return null;
  }
}

module.exports = MagicWord;

MagicWord.list = new Map(Object.entries({
  ...require('./src/date'),
  ...require('./src/format'),
  ...require('./src/metadata'),
  ...require('./src/logic'),
  ...require('./src/math'),
  ...require('./src/other'),
}));
