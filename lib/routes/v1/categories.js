'use strict';

const express = require('express');
const { param } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const {
  Namespace, CategoryLink, Article,
} = require('../../models');
const middlewares = require('../../middlewares');
const Response = require('../../responses');

const router = express.Router({ mergeParams: true });

router.get(
  '/:categoryTitle',
  [
    param('categoryTitle')
      .trim()
      .custom(v => Article.validateTitle(v)),
  ],
  [
    sanitizeParam('categoryTitle').trim(),
  ],
  middlewares.validate(),
  async (req, res, next) => {
    try {
      const categoryLinks = await CategoryLink.findLinks(req.params.categoryTitle);
      const subcategories = [];
      const members = [];
      for (const link of categoryLinks) {
        if (link.sourceArticle.namespaceId === Namespace.Known.CATEGORY.id) {
          subcategories.push(link.sourceArticle.title);
        } else {
          members.push(link.sourceArticle.fullTitle);
        }
      }
      return new Response.Success({ subcategories, members }).send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
