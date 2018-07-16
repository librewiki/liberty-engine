'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });
const SpecialPermissions = require('../../SpecialPermissions');
const Response = require('../../responses');

router.get(
  '/',
  async (req, res, next) => {
    try {
      new Response.Success({
        specialPermissions: Object.keys(SpecialPermissions),
      }).send(res);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
