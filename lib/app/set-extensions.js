'use strict';

const express = require('express');
const doXml = require('../LibertyParser/src/work/doXml');
const hookModule = require('../LibertyParser/src/work/hook');
const doSanitize = require('../LibertyParser/src/work/doSanitize');
const notification = require('../notification');
const Response = require('../responses');

const router = express.Router({ mergeParams: true });

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
    setHook({ type, hook }) {
      hookModule.set({ type, hook });
    },
  },
  addNotifier(notifier) {
    notification.notifiers.push(notifier);
  },
};

const extensions = [
  'footnote',
  'embed-video',
  'notifier-telegram',
  'syntax-highlight',
];

const configurableExtensions = [];

const addRoutes = ({ extensionName, configurator }) => {
  router.get(
    `/${extensionName}/form`,
    async (req, res, next) => {
      try {
        const [formSchema, currentData] = await Promise.all([
          configurator.getFormSchema(),
          configurator.getCurrentData(),
        ]);
        return new Response.Success({ formSchema, currentData }).send(res);
      } catch (err) {
        return next(err);
      }
    },
  );
  router.put(
    `/${extensionName}/configuration`,
    async ({ body }, res, next) => {
      try {
        await configurator.set(body);
        return new Response.Success().send(res);
      } catch (err) {
        return next(err);
      }
    },
  );
};

module.exports = async () => {
  for (const extensionName of extensions) {
    /* eslint-disable import/no-dynamic-require */
    const extension = require(`../../extensions/${extensionName}`);
    await extension.import(extensionHelper);
    if (extension.configurator) {
      configurableExtensions.push(extensionName);
      addRoutes({ extensionName, configurator: extension.configurator });
    }
  }
};

module.exports.router = router;
module.exports.configurableExtensions = configurableExtensions;
