'use strict';

const express = require('express');

const router = express.Router();
const Response = require('../responses');
const { Setting } = require('../models');
const WikitextParser = require('../LibertyParser/src/Parser/WikitextParser');
const middlewares = require('../middlewares');
const { SET_SITE_NOTICE } = require('../specialPermissionConstants');

let noticeHtml = null;

async function registerCache(wikitext) {
  const parser = new WikitextParser();
  const renderResult = await parser.parseRender({ wikitext });
  noticeHtml = renderResult.html;
}

router.get('/',
  async (req, res, next) => {
    if (!noticeHtml) {
      const noticeWikitext = Setting.get('site-notice');
      if (noticeWikitext) {
        await registerCache(noticeWikitext);
      }
    }
    new Response.Success({
      siteNotice: {
        html: noticeHtml,
      },
    }).send(res);
  }
);

router.get('/wikitext',
  async (req, res, next) => {
    new Response.Success({
      siteNoticeWikitext: Setting.get('site-notice') || null,
    }).send(res);
  }
);

router.put('/',
  middlewares.permission(SET_SITE_NOTICE),
  async (req, res, next) => {
    if (!req.body.wikitext || typeof req.body.wikitext !== 'string') {
      return new Response.BadRequest().send(res);
    }
    await Setting.set('site-notice', req.body.wikitext);
    await registerCache(req.body.wikitext);
    return new Response.Success().send(res);
  }
);

module.exports = router;
