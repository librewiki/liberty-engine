'use strict';

const express = require('express');

const router = express.Router();

const { ArticleLink } = require('../models');
const Response = require('../src/responses');

router.get('/',
  async (req, res, next) => {
    try {
      if (req.query.to) {
        const links = await ArticleLink.findBackLinks(req.query.to);
        return new Response.Success({ links }).send(res);
      }
      return new Response.BadRequest().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
