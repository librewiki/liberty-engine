'use strict';

const MagicWord = require('../');
const moment = require('moment');

new MagicWord('CURRENTYEAR', false, (parsingData, params) => {
  return String(new Date().getFullYear());
});

new MagicWord('CURRENTMONTH', false, (parsingData, params) => {
  let res = new Date().getMonth() + 1;
  if (res < 10) {
    res = '0' + res;
  }
  return String(res);
});

new MagicWord('CURRENTMONTH1', false, (parsingData, params) => {
  return String(new Date().getMonth() + 1);
});

new MagicWord('CURRENTMONTHNAME', false, (parsingData, params) => {
  return new Date().toLocaleString('en-us', { month: 'long' });
});

new MagicWord('CURRENTMONTHNAMEGEN', false, (parsingData, params) => {
  return new Date().toLocaleString('en-us', { month: 'long' });
});

new MagicWord('CURRENTMONTHABBREV', false, (parsingData, params) => {
  return new Date().toLocaleString('en-us', { month: 'short' });
});

new MagicWord('CURRENTWEEK', false, (parsingData, params) => {
  return String(moment().week());
});
