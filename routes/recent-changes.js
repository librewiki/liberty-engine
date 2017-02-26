'use strict';

const express = require('express');
const router = express.Router();
const recentChanges = require('../src/recentChanges');
const Response = require('../src/responses');

router.get('/',
  async (req, res, next) => {
    try {
      const recents = await recentChanges.get({ limit: 10 });
      new Response.Success({ recentChanges: recents }).send(res);
    } catch (e) {
      new Response.ServerError().send(res);
    }
  }
);

module.exports = router;
