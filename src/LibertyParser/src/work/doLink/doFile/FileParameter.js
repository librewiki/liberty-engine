'use strict';

class FileParameter {
  constructor(tester, fn) {
    this.tester = tester;
    this.fn = fn;
  }

  test(argText) {
    if (typeof this.tester === 'function') {
      return this.tester(argText);
    } else {
      return this.tester.test(argText);
    }
  }

  run(fileData, input, option) {
    this.fn(fileData, input, option);
  }

  static noInline($, option) {
    option.inline = false;
    if (!$('div.image-warpper').length) {
      $($(':root')).wrap('<div class="image-warpper"></div>');
    }
  }

}

module.exports = FileParameter;
