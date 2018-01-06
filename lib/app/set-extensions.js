'use strict';

const doXml = require('../LibertyParser/src/work/doXml');
const doSanitize = require('../LibertyParser/src/work/doSanitize');
const notification = require('../notification');

const extensionHelper = {
  parserHook: {
    setXmlHook({
      type, selector, hook, allowedTags, allowedAttributes,
    }) {
      doXml.set({ type, selector, hook });
      if (allowedTags) {
        doSanitize.allowedTags.push(...allowedTags);
      }
      if (allowedAttributes) {
        Object.assign(doSanitize.allowedAttributes, allowedAttributes);
      }
    },
  },
  addNotifier(notifier) {
    notification.notifiers.push(notifier);
  },
};

module.exports = () => {
  const footnote = require('../../extensions/footnote');
  const embedVideo = require('../../extensions/embed-video');
  const notifierTelegram = require('../../extensions/notifier-telegram');
  footnote.import(extensionHelper);
  embedVideo.import(extensionHelper);
  notifierTelegram.import(extensionHelper);
};
