'use strict';

const express = require('express');

const router = express.Router();

const Response = require('../../responses');

const { Setting } = require('../../models');

router.get(
  '/',
  async (req, res, next) => {
    try {
      new Response.Success({
        publicSettings: {
          wikiName: Setting.get('wikiName'),
          frontPage: Setting.get('frontPage'),
          favicon: Setting.get('favicon') || {},
          siteNotice: {
            html: await Setting.getSiteNoticeHtml(),
          },
        },
      }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
