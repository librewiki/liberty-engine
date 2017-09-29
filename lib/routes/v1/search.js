'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

const {
  ArticleSearch, Article, Namespace,
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

router.get('/article-case-insensitive-with-redirection/:fullTitle',
  async (req, res, next) => {
    try {
      const result = await Article.findByFullTitleWithRedirection({
        fullTitle: req.params.fullTitle,
        caseSenstive: false,
      });
      if (!result) {
        return new Response.ResourceNotFound().send(res);
      }
      const fullTitle = Namespace.joinNamespaceIdTitle(
        result.article.namespaceId,
        result.article.title
      );
      return new Response.Success({ type: result.type, fullTitle }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
