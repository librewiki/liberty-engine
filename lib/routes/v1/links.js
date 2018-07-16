'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

const { Namespace, ArticleLink, FileLink } = require('../../models');
const Response = require('../../responses');

router.get(
  '/',
  async (req, res, next) => {
    try {
      if (req.query.to) {
        const articleLinks = await ArticleLink.findLinks(req.query.to);
        let fileLinks = [];
        const { namespace, title } = Namespace.splitFullTitle(req.query.to);
        if (Namespace.Known.FILE.id === namespace.id) {
          fileLinks = await FileLink.findLinks(title);
        }
        return new Response.Success({ articleLinks, fileLinks }).send(res);
      }
      return new Response.BadRequest().send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
