'use strict';

const express = require('express');
const router = express.Router();
const { sequelize, Article, Namespace, Revision } = require(global.rootdir + '/models');
const Response = require(global.rootdir + '/src/responses');

router.get('/',
  async (req, res, next) => {
    let limit = Number(req.query.limit);
    if (!limit) {
      limit = 10;
    }
    if (limit > 100) {
      return new Response.BadRequest().send(res);
    }
    let articles;
    try {
      if (req.query.random === 'true' || req.query.random === '1') {
        articles = await Article.findRandomly({ limit });
      } else {
        articles = await Article.findAll({ limit });
      }
      return new Response.Success({ articles }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/',
  async (req, res, next) => {
    try {
      await Article.createNew({
        ipAddress: req.ipAddress,
        fullTitle: req.body.fullTitle,
        author: req.user,
        wikitext: req.body.wikitext,
        summary: req.body.summary
      });
      new Response.Created().send(res);
    } catch (err) {
      next(err);
    }
  }
);

/* rename article */
router.put('/full-title/:fullTitle/full-title',
  async (req, res, next) => {
    try {
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      if (req.params.fullTitle === req.body.fullTitle) {
        return new Response.BadRequest({ name: 'NoChangeError', message: 'No change' }).send(res);
      }
      await article.rename({
        ipAddress: req.ipAddress,
        author: req.user,
        newFullTitle: req.body.fullTitle,
        summary: req.body.summary
      });
      return new Response.Success().send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/full-title/:fullTitle/wikitext',
  async (req, res, next) => {
    try {
      //@TODO Permission
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      const latestRevision = await article.getLatestRevision({ includeWikitext: true });
      if (!req.body.latestRevisionId || latestRevision.id > req.body.latestRevisionId) {
        return new Response.BadRequest({ name: 'EditConflictError', message: 'edit conflict' }).send(res);
      }
      if (req.body.wikitext === latestRevision.wikitext.text) {
        return new Response.BadRequest({ name: 'NoChangeError', message: 'No change' }).send(res);
      }
      await article.edit({
        ipAddress: req.ipAddress,
        author: req.user,
        wikitext: req.body.wikitext,
        summary: req.body.summary
      });
      return new Response.Success().send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/full-title/:fullTitle',
  async (req, res, next) => {
    try {
      const fields = req.queryData.fields || ['namespaceId', 'title', 'updatedAt'];
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      const result = {};
      const promises = [];
      if (fields.includes('revisions')) {
        promises.push(
          article.getRevisions({
            include: [Revision.associations.author],
            order: [['id', 'DESC']],
          })
          .then((revisions) => {
            result.revisions = revisions.map((revision) => {
              return {
                id: revision.id,
                changedLength: revision.changedLength,
                createdAt: revision.createdAt,
                authorName: revision.author? revision.author.username : null,
                ipAddress: revision.author? null : revision.ipAddress
              };
            });
          })
        );
      }
      if (fields.includes('namespaceId')) {
        result.namespaceId = article.namespaceId;
      }
      if (fields.includes('title')) {
        result.title = article.title;
      }
      if (fields.includes('updatedAt')) {
        result.updatedAt = article.updatedAt;
      }
      if (fields.includes('fullTitle')) {
        result.fullTitle = article.fullTitle;
      }
      if (fields.includes('latestRevisionId')) {
        result.latestRevisionId = article.latestRevisionId;
      }
      if (fields.includes('wikitext')) {
        promises.push(
          article.getLatestRevision({ includeWikitext: true })
          .then((revision) => {
            result.wikitext = revision.wikitext.text;
          })
        );
      }
      if (fields.includes('html')) {
        promises.push(
          article.render()
          .then((renderResult) => {
            result.html = renderResult.html;
          })
        );
      }
      await Promise.all(promises);
      return new Response.Success({ article: result }).send(res);
    } catch (err) {
      next(err);
    }
  }
);


/* delete article */
router.delete('/full-title/:fullTitle',
  async (req, res, next) => {
    try {
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      await article.delete({
        ipAddress: req.ipAddress,
        author: req.user,
        summary: req.body.summary
      });
      return new Response.Success().send(res);
    } catch (err) {
      next(err);
    }
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

router.get('/full-title-ci/:fullTitle',
  async (req, res, next) => {
    try {
      const { namespace, title } = Namespace.splitFullTitle(req.params.fullTitle);
      const [result] = await sequelize.query(findQuery, {
        replacements: {
          namespaceId: namespace.id,
          title: title,
          lowercaseTitle: title.toLowerCase()
        }, type: sequelize.QueryTypes.SELECT
      });
      if (!result) {
        return new Response.ResourceNotFound().send(res);
      }
      const fullTitle = Namespace.joinNamespaceIdTitle(result.namespaceId, result.title);
      switch (result.priority) {
        case 0:
          return new Response.Success({ type: 'EXACT', fullTitle }).send(res);
        case 1:
          return new Response.Success({ type: 'REDIRECTION', fullTitle }).send(res);
        case 2:
          return new Response.Success({ type: 'CASE_INSENSITIVE', fullTitle }).send(res);
        case 3:
          return new Response.Success({ type: 'CASE_INSENSITIVE_REDIRECTION', fullTitle }).send(res);
        default:
          throw new Error();
      }
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;