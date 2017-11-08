'use strict';

const express = require('express');

const router = express.Router();

const Response = require('../../responses');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const middlewares = require('../../middlewares');
const { SET_WIKI_NAME, SET_FRONT_PAGE, SET_SITE_NOTICE } = require('../../SpecialPermissions');

const { Article, Setting } = require('../../models');

router.get(
  '/',
  async (req, res, next) => {
    try {
      return new Response.Success({
        settings: {
          wikiName: Setting.get('wikiName'),
          frontPage: Setting.get('frontPage'),
          siteNoticeWikitext: Setting.get('siteNoticeWikitext'),
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
  middlewares.validate(),
  async (req, res, next) => {
    try {
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
      .custom(v => Article.validateFullTitle(v)),
  ],
  [
    sanitizeBody('frontPage').trim(),
  ],
  middlewares.validate(),
  async (req, res, next) => {
    try {
      await Setting.set('frontPage', req.body.frontPage);
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.put(
  '/site-notice',
  middlewares.permission(SET_SITE_NOTICE),
  [
    body('wikitext').isLength({ min: 0, max: 4000000 }),
  ],
  [
    sanitizeBody('wikitext').trim(),
  ],
  middlewares.validate(),
  async (req, res, next) => {
    try {
      await Setting.set('siteNoticeWikitext', req.body.wikitext);
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
