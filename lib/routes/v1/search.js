'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

const {
  ArticleSearch,
} = require('../../models');

const Response = require('../../responses');

/* GET /search/articles */
router.get('/articles',
  async (req, res, next) => {
    try {
      const query = req.query.q ? req.query.q.trim() : null;
      const offset = Number(req.query.offset) || 0;
      if (!query) {
        return new Response.BadRequest().send(res);
      }
      const articles = await ArticleSearch.search({
        query,
        offset,
        limit: 10,
      });
      return new Response.Success({ articles }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
