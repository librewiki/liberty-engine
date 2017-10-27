'use strict';

const moment = require('moment');

const obj = new Map();

module.exports = {
  set: (key, value) => {
    obj.set(key, { value, exp: null });
  },
  get: (key) => {
    const found = obj.get(key);
    if (!found) return null;
    const { value, exp } = found;
    if (exp && exp < moment()) {
      obj.delete(key);
      return null;
    }
    return value;
  },
  expire: (key, ttl) => {
    const found = obj.get(key);
    if (!found) return;
    const { exp, value } = found;
    if (exp && exp < moment()) {
      obj.delete(key);
      return;
    }
    obj.set(key, { value, exp: moment().add(ttl, 'seconds') });
  },
};
