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

router.get('/:fullTitle',
  (req, res, next) => {
    const fields = req.queryData.fields || ['namespaceId', 'title', 'createdAt', 'updatedAt'];
    return Article.findByFullTitle(req.params.fullTitle)
    .then((article) => {
      if (req.queryData.fields.includes('html')) {
        return article.render()
        .then((renderResult) => {
          return _.pick(_.merge({}, article, { html: renderResult.html }), fields);
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
  }
);


module.exports = router;
