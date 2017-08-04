'use strict';

const express = require('express');

const router = express.Router();

const Response = require('../responses');

const { Setting } = require('../models');

router.get('/',
  async (req, res, next) => {
    try {
      new Response.Success({
        wikiName: Setting.get('wikiName'),
        frontPage: Setting.get('frontPage'),
      }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
