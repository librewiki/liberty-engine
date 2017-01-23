'use strict';
class ArrayMap extends Map {
  constructor(...args) {
    super(args);
    this.numOfNumbered = 0;
  }
  get(key) {
    if (typeof key === 'number') {
      return super.get(String(key));
    } else {
      return super.get(key);
    }
  }
  push(...values) {
    for (const value of values) {
      this.set(String(this.numOfNumbered), value);
      this.numOfNumbered++;
    }
    return this.numOfNumbered;
  }
}
module.exports = ArrayMap;
