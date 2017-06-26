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
    const splited = fullTitle.split(':')[0].trim();
    if (this.list.get(splited) && fullTitle.indexOf(':') !== -1 && this.list.get(splited).needColon && this.list.get(splited).enabled) {
      return this.list.get(splited);
    } else if (
      this.list.get(fullTitle) &&
      !this.list.get(fullTitle).needColon &&
      this.list.get(fullTitle).enabled
    ) {
      return this.list.get(fullTitle);
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
