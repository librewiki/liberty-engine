'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

const {
  ArticleSearch, Article, Namespace,
} = require('../../models');

const Response = require('../../responses');

/* GET /search/articles */
router.get(
  '/articles',
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
  },
);

router.get(
  '/article-case-insensitive-with-redirection/:fullTitle',
  async (req, res, next) => {
    try {
      const { article, type } = await Article.findByFullTitleWithRedirection({
        fullTitle: req.params.fullTitle,
        caseSenstive: false,
      });
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      const fullTitle = Namespace.joinNamespaceIdTitle(
        article.namespaceId,
        article.title,
      );
      return new Response.Success({ type, fullTitle }).send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
