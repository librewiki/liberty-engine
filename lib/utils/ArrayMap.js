'use strict';

class ArrayMap extends Map {
  constructor(...args) {
    super(args);
    this.numOfNumbered = 0;
  }

  get(key) {
    if (typeof key === 'number') {
      return super.get(String(key));
    }
    return super.get(key);
  }

  push(...values) {
    for (const value of values) {
      this.set(String(this.numOfNumbered), value);
      this.numOfNumbered += 1;
    }
    return this.numOfNumbered;
  }
}
module.exports = ArrayMap;
