'use strict';

const FileParameter = require('../FileParameter');

module.exports = [
  new FileParameter((input) => {
    if (input.startsWith('x') && input.endsWith('px')) {
      let num = input.slice(1, -2);
      return (num && !isNaN(num));
    }
  }, ($, input) => {
    $('img').css('height', input.slice(1));
  }),
  new FileParameter((input) => {
    if (input.endsWith('px')) {
      let num = input.slice(0, -2);
      return num && !isNaN(num);
    }
  }, ($, input) => {
    $('img').css('width', input);
  }),
  new FileParameter((input) => {
    if (input.endsWith('px')) {
      let idx = input.indexOf('x');
      if (idx !== -1) {
        let width = input.slice(0, idx);
        let height = input.slice(idx + 1, -2);
        return width && height && !isNaN(width) && !isNaN(height);
      }
    }
  }, ($, input) => {
    let idx = input.indexOf('x');
    let width = input.slice(0, idx);
    let height = input.slice(idx + 1, -2);
    $('img').css('width', width + 'px').css('height', height + 'px');
  }),
];
