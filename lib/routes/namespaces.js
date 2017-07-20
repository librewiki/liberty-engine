'use strict';

const express = require('express');

const router = express.Router();
const { Namespace } = require('../models');
const Response = require('../responses');

router.get('/',
  (req, res, next) => {
    try {
      new Response.Success({ namespaces: Namespace.getAll() }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
