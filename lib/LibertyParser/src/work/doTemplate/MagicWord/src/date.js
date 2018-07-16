'use strict';

const moment = require('moment');
const MagicWord = require('../');

module.exports = {
  CURRENTYEAR: new MagicWord('CURRENTYEAR', false, () => String(new Date().getFullYear())),
  CURRENTMONTH: new MagicWord('CURRENTMONTH', false, () => {
    let res = new Date().getMonth() + 1;
    if (res < 10) {
      res = `0${res}`;
    }
    return String(res);
  }),
  CURRENTMONTH1: new MagicWord('CURRENTMONTH1', false, () => String(new Date().getMonth() + 1)),
  CURRENTMONTHNAME: new MagicWord('CURRENTMONTHNAME', false, () => new Date().toLocaleString('en-us', { month: 'long' })),
  CURRENTMONTHNAMEGEN: new MagicWord('CURRENTMONTHNAMEGEN', false, () => new Date().toLocaleString('en-us', { month: 'long' })),
  CURRENTMONTHABBREV: new MagicWord('CURRENTMONTHABBREV', false, () => new Date().toLocaleString('en-us', { month: 'short' })),
  CURRENTWEEK: new MagicWord('CURRENTWEEK', false, () => String(moment().week())),
};
