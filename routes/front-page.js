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
  (req, res, next) => {
    return req.user.hasPermissionTo('SET_PUBLIC_SETTINGS')
    .then((hasPermission) => {
      if (hasPermission) {
        next();
      } else {
        return new Response.Unauthorized().send(res);
      }
    });
  },
  (req, res, next) => {
    let frontPage = publicSettings.get('front-page');
    if (!frontPage) {
      frontPage = 'front page';
    }
    new Response.Success({ frontPage }).send(res);
  }
);
module.exports = router;
