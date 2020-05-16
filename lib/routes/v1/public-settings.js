'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

const Response = require('../../responses');
const { Setting } = require('../../models');
const licenses = require('../../licenses');

router.get(
  '/',
  async (req, res, next) => {
    try {
      new Response.Success({
        publicSettings: {
          wikiName: Setting.get('wikiName'),
          frontPage: Setting.get('frontPage'),
          favicon: Setting.get('favicon') || {},
          license: licenses[Setting.get('license') || 'OTHERS'],
          siteNotice: {
            html: await Setting.getSiteNoticeHtml(),
          },
        },
      }).send(res);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
