'use strict';

const express = require('express');

const router = express.Router();

const Response = require('../../responses');
const { MalformedTitleError } = require('../../errors');

const {
  body, validationResult,
} = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const middlewares = require('../../middlewares');
const { SET_WIKI_NAME, SET_FRONT_PAGE } = require('../../specialPermissionConstants');

const { Article, Setting } = require('../../models');

router.get(
  '/',
  async (req, res, next) => {
    try {
      return new Response.Success({
        settings: {
          wikiName: Setting.get('wikiName'),
          frontPage: Setting.get('frontPage'),
        },
      }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.put(
  '/wiki-name',
  middlewares.permission(SET_WIKI_NAME),
  [
    body('wikiName')
      .trim()
      .isLength({ min: 1, max: 30 }),
  ],
  [
    sanitizeBody('wikiName').trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return new Response.BadRequest({ errors: errors.array() }).send(res);
      }
      await Setting.set('wikiName', req.body.wikiName);
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.put(
  '/front-page',
  middlewares.permission(SET_FRONT_PAGE),
  [
    body('frontPage')
      .trim()
      .custom((v) => {
        if (!Article.validateFullTitle(v)) {
          throw new MalformedTitleError();
        }
        return v;
      }),
  ],
  [
    sanitizeBody('frontPage').trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return new Response.BadRequest({ errors: errors.array() }).send(res);
      }
      await Setting.set('frontPage', req.body.frontPage);
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
