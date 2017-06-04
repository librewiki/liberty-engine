/**
 * Cache and provides recent changes.
 *
 * @module recentChanges
 */

'use strict';

const _ = require('lodash');
const _cache = [];   // caches maximum 100 changes
module.exports = {
  /**
   * @method get
   * @param {Object} option
   * @param {Function} [option.filter] function to filter results.
   * @param {Number} [option.limit=10] maximum number of results.
   * @return {Promise<String>} Returns a replaced wikitext.
   */
  get({ filter, limit = 10 } = {}) {
    return Promise.resolve()
    .then(() => [
      {
        "title": "미다스",
        "createdAt": "2016-12-31T03:51:33Z"
      },
      {
        "title": "aaaAAAbbb",
        "createdAt": "2016-12-31T02:01:23Z"
      }
    ])
    .then((results) => {
      if (filter) {
        return _(results).filter(filter).take(limit).value();
      } else {
        return _(results).take(limit).value();
      }
    });
  }
};
