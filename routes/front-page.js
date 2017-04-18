'use strict';

const express = require('express');
const router = express.Router();
const Response = require(global.rootdir + '/src/responses');
const models = require(global.rootdir + '/models');
const middlewares = require(global.rootdir + '/src/middlewares');

router.get('/',
  (req, res, next) => {
    try {
      let frontPage = models.Setting.get('front-page');
      if (!frontPage) {
        frontPage = 'front page';
      }
      new Response.Success({ frontPage }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/',
  middlewares.userShouldHaveAnyRole(['sysop']),
  async (req, res, next) => {
    try {
      if (typeof req.body.frontPage === 'string') {
        models.Setting.set('front-page', req.body.frontPage);
        new Response.Success().send(res);
      } else {
        new Response.BadRequest().send(res);
      }
    } catch (err) {
      next(err);
    }
  }
);
module.exports = router;
