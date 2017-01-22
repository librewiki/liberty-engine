'use strict';

const express = require('express');
const router = express.Router();
const { sequelize, Article, Namespace } = require('../models');
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

const findQuery = `(
	SELECT namespaceId, title, 0 as priority
	FROM articles
	WHERE namespaceId = :namespaceId AND title = :title AND deletedAt IS NULL
)
UNION ALL
(
	SELECT articles.namespaceId, articles.title, 1 as priority
	FROM redirections, articles
	WHERE sourceNamespaceId = :namespaceId AND sourceTitle = :title AND destinationArticleId = articles.id
)
UNION ALL
(
	SELECT namespaceId, title, 2 as priority
	FROM articles
	WHERE namespaceId = :namespaceId AND lowercaseTitle = :lowercaseTitle AND deletedAt IS NULL
)
UNION ALL
(
	SELECT articles.namespaceId, articles.title, 3 as priority
	FROM redirections, articles
	WHERE sourceNamespaceId = :namespaceId AND lowercaseSourceTitle = :lowercaseTitle AND destinationArticleId = articles.id
)
ORDER BY priority LIMIT 1`;

router.get('/full-title-ci/:fullTitle(*)',
  (req, res, next) => {
    const { namespace, title } = Namespace.splitFullTitle(req.params.fullTitle);

    return sequelize.query(findQuery, {
      replacements: {
        namespaceId: namespace.id,
        title: title,
        lowercaseTitle: title.toLowerCase()
      }, type: sequelize.QueryTypes.SELECT
    })
    .then(([result]) => {
      if (result) {
        const fullTitle = Namespace.joinNamespaceIdTitle(result.namespaceId, result.title);
        switch (result.priority) {
          case 0:
            new Response.Success({ type: 'EXACT', fullTitle }).send(res);
            break;
          case 1:
            new Response.Success({ type: 'REDIRECTION', fullTitle }).send(res);
            break;
          case 2:
            new Response.Success({ type: 'CASE_INSENSITIVE', fullTitle }).send(res);
            break;
          case 3:
            new Response.Success({ type: 'CASE_INSENSITIVE_REDIRECTION', fullTitle }).send(res);
            break;
          default:
            throw new Error();
        }
      } else {
        new Response.ResourceNotFound().send(res);
      }
    });
  }
);


module.exports = router;
