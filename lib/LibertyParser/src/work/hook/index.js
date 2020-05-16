'use strict';

const hooks = {
  afterParsing: new Set(),
};

/**
 * @param {number} type
 * @param {function} hook
 */
module.exports.set = ({ type, hook }) => hooks[type].add(hook);

async function run({ type, intermediate, parsingData }) {
  for (const hook of hooks[type]) {
    intermediate = hook(intermediate, parsingData);
  }
  return intermediate;
}

module.exports.run = run;
