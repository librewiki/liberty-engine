'use strict';

const express = require('express');
const router = express.Router();
const Response = require(global.rootdir + '/src/responses');
const publicSettings = require(global.rootdir + '/src/publicSettings');
const middlewares = require(global.rootdir + '/src/middlewares');

router.get('/',
  (req, res, next) => {
    let frontPage = publicSettings.get('front-page');
    if (!frontPage) {
      frontPage = 'front page';
    }
    new Response.Success({ frontPage }).send(res);
  }
);

router.put('/', middlewares.userShouldHaveAnyRole(['admin']),
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
