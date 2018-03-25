'use strict';

const express = require('express');

const router = express.Router();

const Response = require('../../responses');

const { configurableExtensions, router: extensionRouter } = require('../../app/set-extensions');

router.get(
  '/configurable-extensions',
  async (req, res, next) => {
    try {
      return new Response.Success({ configurableExtensions }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.use(extensionRouter);

module.exports = router;
