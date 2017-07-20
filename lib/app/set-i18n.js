'use strict';

const i18next = require('i18next');
const en = require('../../i18n/en.json');
const ko = require('../../i18n/ko.json');

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
