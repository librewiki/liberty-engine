'use strict';

const express = require('express');
const router = express.Router();
const Response = require('../src/responses');
const publicSettings = require('../src/publicSettings');

router.get('/',
  (req, res, next) => {
    let frontPage = publicSettings.get('front-page');
    if (!frontPage) {
      frontPage = 'front page';
    }
    new Response.Success({ frontPage }).send(res);
  }
);

router.put('/',
  async (req, res, next) => {
    if (await req.user.hasPermissionTo('SET_PUBLIC_SETTINGS')) {
      next();
    } else {
      new Response.Unauthorized().send(res);
    }
  },
  (req, res, next) => {
    if (typeof req.body.data.frontPage === 'string') {
      let frontPage = publicSettings.set('front-page', req.body.data.frontPage);
      new Response.Success({ frontPage }).send(res);
    } else {
      new Response.BadRequest().send(res);
    }
  }
);
module.exports = router;
