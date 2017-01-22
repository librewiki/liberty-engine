'use strict';

const express = require('express');
const router = express.Router();
const { Article } = require('../models');
const Response = require('../src/responses');

const _ = require('lodash');

router.post('/',
  (req, res, next) => {
  }
);

router.get('/',
  (req, res, next) => {
    let limit = Number(req.query.limit);
    if (!limit) {
      limit = 10;
    }
    if (limit > 100) {
      return new Response.BadRequest().send(res);
    }
    return Promise.resolve()
    .then(() => {
      if (req.query.random === 'true' || req.query.random === '1') {
        return Article.findRandomly({ limit });
      } else {
        return Article.findAll({ limit });
      }
    })
    .then((articles) => {
      new Response.Success({ articles }).send(res);
    }, (err) => {
      console.log(err);
      next(err);
    });
  }
);

router.get('/full-title/:fullTitle(*)',
  (req, res, next) => {
    const fields = req.queryData.fields || ['namespaceId', 'title', 'createdAt', 'updatedAt'];
    return Article.findByFullTitle(req.params.fullTitle)
    .then((article) => {
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      return Promise.resolve()
      .then(() => {
        if (req.queryData.fields.includes('html')) {
          return article.render()
          .then((renderResult) => {
            return _.merge({}, _.pick(article, fields), { html: renderResult.html });
          });
        } else {
          return _.pick(article, fields);
        }
      })
      .then((article) => {
        new Response.Success({ article }).send(res);
      }, (err) => {
        next(err);
      });
    });

  }
);

router.get('/full-title-ci/:fullTitle(*)',
  (req, res, next) => {
    return Article.findByFullTitle(req.params.fullTitle)
    .then((article) => {
      if (article) {
        new Response.Success({ isExact: true, fullTitle: article.fullTitle }).send(res);
      } else {
        return Article.findByFullTitleCaseInsensitive(req.params.fullTitle)
        .then((article) => {
          if (article) {
            new Response.Success({ isExact: false, fullTitle: article.fullTitle }).send(res);
          } else {
            new Response.ResourceNotFound().send(res);
          }
        });
      }
    })
    .catch(() => {
      new Response.ServerError().send(res);
    });
  }
);

module.exports = router;
