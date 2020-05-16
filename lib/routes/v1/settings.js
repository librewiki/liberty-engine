'use strict';

const express = require('express');
const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const i18n = require('../../../i18n');
const Response = require('../../responses');
const middlewares = require('../../middlewares');
const {
  SET_WIKI_NAME, SET_LANGUAGE, SET_FRONT_PAGE, SET_SITE_NOTICE, SET_EMAIL, SET_LICENSE,
} = require('../../SpecialPermissions');
const { Article, Setting } = require('../../models');
const licenses = require('../../licenses');

const availableLicenses = Object.keys(licenses);

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  async (req, res, next) => {
    try {
      return new Response.Success({
        settings: {
          wikiName: Setting.get('wikiName'),
          frontPage: Setting.get('frontPage'),
          siteNoticeWikitext: Setting.get('siteNoticeWikitext'),
          language: Setting.get('language'),
          license: Setting.get('license'),
          availableLanguages: i18n.availableLanguages,
          availableLicenses,
        },
      }).send(res);
    } catch (err) {
      return next(err);
    }
  },
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
  },
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
  },
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
  },
);

router.put(
  '/language',
  middlewares.permission(SET_LANGUAGE),
  [
    body('language')
      .trim()
      .isLength({ min: 2, max: 6 }),
  ],
  [
    sanitizeBody('language').trim(),
  ],
  middlewares.validate(),
  async ({ body: { language } }, res, next) => {
    try {
      if (!i18n.availableLanguages.includes(language)) {
        return new Response.BadRequest().send(res);
      }
      await Setting.set('language', language);
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  },
);

router.get(
  '/email',
  middlewares.permission(SET_EMAIL),
  async (req, res, next) => {
    try {
      let email = Setting.get('email');
      if (email) {
        email.password = null;
      } else {
        email = {
          host: null,
          port: null,
          secure: null,
          user: null,
          password: null,
        };
      }
      return new Response.Success({
        email,
      }).send(res);
    } catch (err) {
      return next(err);
    }
  },
);

router.put(
  '/email',
  middlewares.permission(SET_EMAIL),
  [
    body('host').trim().isLength({ min: 1, max: 300 }),
    body('port').custom(v => Number.isInteger(v)),
    body('secure').custom(v => typeof v === 'boolean'),
    body('user').trim().isLength({ min: 1, max: 300 }),
    body('password').isLength({ min: 1 }),
  ],
  [
    sanitizeBody('host').trim(),
    sanitizeBody('user').trim(),
  ],
  middlewares.validate(),
  async ({
    body: {
      host, port, secure, user, password,
    },
  }, res, next) => {
    try {
      await Setting.set('email', {
        host, port, secure, user, password,
      });
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  },
);

router.put(
  '/license',
  middlewares.permission(SET_LICENSE),
  [
    body('license').trim().isIn(availableLicenses),
  ],
  [
    sanitizeBody('license').trim(),
  ],
  middlewares.validate(),
  async ({
    body: {
      license,
    },
  }, res, next) => {
    try {
      await Setting.set('license', license);
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
