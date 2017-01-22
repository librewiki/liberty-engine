'use strict';

const FileParameter = require('../FileParameter');

module.exports = [
  new FileParameter(text => text === 'border', ($, input, option) => {
    $('img').addClass('image-border');
  }),
  new FileParameter(text => text === 'frame', ($, input, option) => {
    FileParameter.noInline($, option);
    $('div.image-warpper')
      .addClass('thumb-inner')
      .wrap('<div class="thumb-outer"></div>');
  }),
];
