'use strict';

const doXml = require('../LibertyParser/src/work/doXml');

const extensionHelper = {
  parserHook: {
    setXmlHook(obj) {
      doXml.set(obj);
    },
  },
};

module.exports = () => {
  const footnote = require('../../extensions/footnote');
  footnote.import(extensionHelper);
};
