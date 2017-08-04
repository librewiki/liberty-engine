'use strict';

const express = require('express');

const router = express.Router();
const Response = require('../responses');
const models = require('../models');
const middlewares = require('../middlewares');

router.get('/',
  (req, res, next) => {
    try {
      let frontPage = models.Setting.get('frontPage');
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
        models.Setting.set('frontPage', req.body.frontPage);
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
