'use strict';

const express = require('express');
const router = express.Router();
const recentChanges = require('../src/recentChanges');
const Response = require('../src/responses');

router.get('/', (req, res, next) => {
  return recentChanges.get({ limit: 10 })
  .then((recentChanges) => {
    new Response.Success({ recentChanges }).send(res);
  }, (err) => {
    new Response.ServerError().send(res);
  });
});

module.exports = router;
