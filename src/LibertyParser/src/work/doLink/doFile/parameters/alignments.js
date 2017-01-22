'use strict';

const FileParameter = require('../FileParameter');

module.exports = [
  new FileParameter(text => text === 'right', ($, input, option) => {
    FileParameter.noInline($, option);
    $('div.image-warpper').addClass('align-right');
  }),
  new FileParameter(text => text === 'left', ($, input, option) => {
    FileParameter.noInline($, option);
    $('div.image-warpper').addClass('align-left');
  }),
  new FileParameter(text => text === 'center', ($, input, option) => {
    FileParameter.noInline($, option);
    $('div.image-warpper').addClass('align-center');
  }),
  new FileParameter(text => text === 'none', ($, input, option) => {
    FileParameter.noInline($, option);
  }),
];
