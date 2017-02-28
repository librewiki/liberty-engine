'use strict';

const express = require('express');
const router = express.Router();
const recentChanges = require(global.rootdir + '/src/recentChanges');
const Response = require(global.rootdir + '/src/responses');

router.get('/',
  async (req, res, next) => {
    try {
      const recents = await recentChanges.get({ limit: 10 });
      new Response.Success({ recentChanges: recents }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
