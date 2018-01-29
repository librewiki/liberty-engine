'use strict';

const i18next = require('i18next');
const en = require('./en.json');
const ko = require('./ko.json');

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  ns: [
    'LibertyParser',
  ],
  resources: {
    en,
    ko,
  },
});

module.exports = i18next;
module.exports.availableLanguages = ['en', 'ko'];
