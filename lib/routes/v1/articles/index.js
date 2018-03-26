'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

const { articleParser } = require('../../../LibertyParser');
const { SET_ARTICLE_PERMISSION } = require('../../../SpecialPermissions');
const { UnauthorizedError } = require('../../../errors');
const { param, query, body } = require('express-validator/check');
const { sanitizeParam, sanitizeQuery, sanitizeBody } = require('express-validator/filter');
const {
  sequelize,
  Article,
  ArticlePermission,
  Namespace,
  Revision,
  Wikitext,
} = require('../../../models');

const middlewares = require('../../../middlewares');
const Response = require('../../../responses');

router.get(
  '/',
  [
    query('limit')
      .optional()
      .trim()
      .isInt({ min: 1, max: 100 }),
    query('offset')
      .optional()
      .trim()
      .isInt({ min: 0 }),
    query('random')
      .optional(),
    query('order')
      .optional()
      .trim()
      .isIn(['updatedAt']),
  ],
  [
    sanitizeQuery('limit').trim().toInt(),
    sanitizeQuery('offset').trim().toInt(),
    sanitizeQuery('random').trim().toBoolean(), // Everything except for '0', 'false' and '' returns true
    sanitizeQuery('order').trim(),
  ],
  middlewares.validate(),
  async (req, res, next) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const random = req.query.random || false;
    const order = req.query.order === 'updatedAt' ? [['updatedAt', 'DESC']] : [];
    let articles;
    try {
      if (random) {
        articles = await Article.findRandomly({ limit });
      } else {
        articles = await Article.findAll({ limit, offset, order });
      }
      return new Response.Success({ articles }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/',
  [
    body('fullTitle')
      .trim()
      .custom(v => Article.validateFullTitle(v)),
    body('wikitext')
      .optional(),
    body('summary')
      .optional(),
  ],
  [
    sanitizeBody('fullTitle').trim(),
    sanitizeBody('wikitext').trim(),
    sanitizeBody('summary').trim(),
  ],
  middlewares.validate(),
  middlewares.checkBlock(),
  async (req, res, next) => {
    try {
      if (!await req.user.isCreatable(Namespace.splitFullTitle(req.body.fullTitle).namespace)) {
        throw new UnauthorizedError();
      }
      await Article.createNew({
        ipAddress: req.ipAddress,
        fullTitle: req.body.fullTitle,
        author: req.user,
        wikitext: req.body.wikitext,
        summary: req.body.summary,
      });
      return new Response.Created().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  '/:fullTitle',
  [
    param('fullTitle')
      .trim()
      .custom(v => Article.validateFullTitle(v)),
    query('fields')
      .optional()
      .trim(),
    query('rev')
      .optional()
      .trim()
      .isInt({ min: 1 }),
  ],
  [
    sanitizeParam('fullTitle').trim(),
    sanitizeQuery('fields').trim(),
    sanitizeQuery('rev').trim().toInt(),
  ],
  middlewares.validate(),
  async (req, res, next) => {
    try {
      const fields = req.query.fields ? req.query.fields.split(',') : ['fullTitle', 'namespaceId', 'title', 'updatedAt'];
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        const isCreatable
          = await req.user.isCreatable(Namespace.splitFullTitle(req.params.fullTitle).namespace);
        return new Response.ResourceNotFound({
          isCreatable,
        }).send(res);
      }
      if (!await req.user.isReadable(article)) {
        throw new UnauthorizedError();
      }

      let oldRev = null;
      let oldRevRenderResult = null;
      if (req.query.rev) {
        oldRev = await Revision.findById(req.query.rev, {
          include: [Wikitext],
        });
        if (oldRev.articleId !== article.id) {
          return new Response.BadRequest().send(res);
        }
        if (fields.includes('categories') || fields.includes('html')) {
          oldRevRenderResult = await articleParser.parseRender({ article, revision: oldRev });
        }
      }

      const result = {};
      const promises = [];
      if (fields.includes('revisions')) {
        promises.push((async () => {
          const revisions = await article.getRevisions({
            include: [Revision.associations.author],
            order: [['id', 'DESC']],
          });
          result.revisions = revisions.map(revision => ({
            id: revision.id,
            changedLength: revision.changedLength,
            createdAt: revision.createdAt,
            summary: revision.summary,
            authorName: revision.author ? revision.author.username : null,
            ipAddress: revision.author ? null : revision.ipAddress,
          }));
        })());
      }
      if (fields.includes('discussionTopics')) {
        promises.push((async () => {
          const discussionTopics = await article.getDiscussionTopics({
            order: [['id', 'DESC']],
          });
          result.discussionTopics = await Promise.all(discussionTopics.map(async (topic) => {
            const firstComment = await topic.getFirstComment();
            return {
              id: topic.id,
              title: topic.title,
              createdAt: topic.createdAt,
              updatedAt: topic.updatedAt,
              firstComment: await firstComment.getPublicObject(),
            };
          }));
        })());
      }
      if (fields.includes('id')) {
        result.id = article.id;
      }
      if (fields.includes('namespaceId')) {
        result.namespaceId = article.namespaceId;
      }
      if (fields.includes('title')) {
        result.title = article.title;
      }
      if (fields.includes('updatedAt')) {
        if (oldRev) {
          result.updatedAt = oldRev.createdAt;
        } else {
          result.updatedAt = article.updatedAt;
        }
      }
      if (fields.includes('fullTitle')) {
        result.fullTitle = article.fullTitle;
      }
      if (fields.includes('latestRevisionId')) {
        result.latestRevisionId = article.latestRevisionId;
      }
      if (fields.includes('allowedActions')) {
        promises.push(article.getAllowedActions(req.user)
          .then((allowedActions) => {
            result.allowedActions = allowedActions;
          }));
      }
      if (fields.includes('numOpenDiscussions')) {
        promises.push(article.countDiscussionTopics({ scope: ['open'] })
          .then((numOpenDiscussions) => {
            result.numOpenDiscussions = numOpenDiscussions;
          }));
      }
      if (fields.includes('permissions')) {
        promises.push(article.getArticlePermissions()
          .then((permissions) => {
            result.permissions = permissions;
          }));
      }
      if (fields.includes('redirections')) {
        promises.push(article.getRedirections()
          .then((redirections) => {
            result.redirections = redirections.map(r => ({
              sourceNamespaceId: r.sourceNamespaceId,
              sourceTitle: r.sourceTitle,
              sourceFullTitle: Namespace.joinNamespaceIdTitle(r.sourceNamespaceId, r.sourceTitle),
            }));
          }));
      }
      if (fields.includes('wikitext')) {
        if (oldRev) {
          result.wikitext = oldRev.wikitext.text;
        } else {
          promises.push(article.getLatestRevision({ includeWikitext: true })
            .then((revision) => {
              result.wikitext = revision.wikitext.text;
            }));
        }
      }
      if (fields.includes('categories')) {
        if (oldRevRenderResult) {
          result.categories = Array.from(oldRevRenderResult.link.categories);
        } else {
          promises.push(article.getCategoryLinks()
            .then((links) => {
              result.categories = links.map(l => l.destinationTitle);
            }));
        }
      }
      if (fields.includes('html')) {
        if (oldRevRenderResult) {
          result.html = oldRevRenderResult.html;
        } else {
          promises.push(article.render()
            .then((renderResult) => {
              result.html = renderResult.html;
            }));
        }
      }
      await Promise.all(promises);
      return new Response.Success({ article: result }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

/* rename article */
router.put(
  '/:fullTitle/full-title',
  [
    param('fullTitle')
      .trim()
      .custom(v => Article.validateFullTitle(v)),
    body('fullTitle')
      .trim()
      .custom(v => Article.validateFullTitle(v)),
  ],
  [
    sanitizeParam('fullTitle').trim(),
    sanitizeBody('fullTitle').trim(),
  ],
  middlewares.validate(),
  middlewares.checkBlock(),
  async (req, res, next) => {
    try {
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      if (!await req.user.isRenamable(article)) {
        throw new UnauthorizedError();
      }
      if (req.params.fullTitle === req.body.fullTitle) {
        return new Response.BadRequest({ name: 'NoChangeError', message: 'No change' }).send(res);
      }
      await article.rename({
        ipAddress: req.ipAddress,
        user: req.user,
        newFullTitle: req.body.fullTitle,
        summary: req.body.summary,
      });
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

/* edit article */
router.put(
  '/:fullTitle/wikitext',
  [
    param('fullTitle')
      .trim()
      .custom(v => Article.validateFullTitle(v)),
    body('wikitext')
      .optional(),
    body('summary')
      .optional(),
  ],
  [
    sanitizeParam('fullTitle').trim(),
    sanitizeBody('wikitext').trim(),
    sanitizeBody('summary').trim(),
  ],
  middlewares.validate(),
  middlewares.checkBlock(),
  async (req, res, next) => {
    try {
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      if (!await req.user.isEditable(article)) {
        throw new UnauthorizedError();
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
        summary: req.body.summary,
      });
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

/* set permissions */
router.put(
  '/:fullTitle/permissions',
  middlewares.permission(SET_ARTICLE_PERMISSION),
  [
    param('fullTitle')
      .trim()
      .custom(v => Article.validateFullTitle(v)),
    body('articlePermissions.*.roleId')
      .custom(v => Number.isInteger(v)),
    body('articlePermissions.*.readable')
      .optional()
      .custom(v => [true, false, null].includes(v)),
    body('articlePermissions.*.editable')
      .optional()
      .custom(v => [true, false, null].includes(v)),
    body('articlePermissions.*.renamable')
      .optional()
      .custom(v => [true, false, null].includes(v)),
    body('articlePermissions.*.deletable')
      .optional()
      .custom(v => [true, false, null].includes(v)),
  ],
  [
    sanitizeParam('fullTitle').trim(),
  ],
  middlewares.validate(),
  middlewares.checkBlock(),
  async ({ params: { fullTitle }, body: { articlePermissions } }, res, next) => {
    try {
      const article = await Article.findByFullTitle(fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      return sequelize.transaction(async (t) => {
        const permissionsToInsert = articlePermissions
          .map(p => ({
            articleId: article.id,
            roleId: p.roleId,
            readable: p.readable,
            editable: p.editable,
            renamable: p.renamable,
            deletable: p.deletable,
          }))
          .filter(p =>
            p.readable !== null ||
            p.editable !== null ||
            p.renamable !== null ||
            p.deletable !== null);
        await ArticlePermission.destroy({ where: { articleId: article.id }, transaction: t });
        await ArticlePermission.bulkCreate(permissionsToInsert, { transaction: t });
        return new Response.Success().send(res);
      });
    } catch (err) {
      return next(err);
    }
  }
);

/* delete article */
router.delete(
  '/:fullTitle',
  [
    param('fullTitle')
      .trim()
      .custom(v => Article.validateFullTitle(v)),
  ],
  [
    sanitizeParam('fullTitle').trim(),
  ],
  middlewares.validate(),
  middlewares.checkBlock(),
  async (req, res, next) => {
    try {
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      if (!await req.user.isDeletable(article)) {
        throw new UnauthorizedError();
      }
      await article.delete({
        ipAddress: req.ipAddress,
        user: req.user,
        summary: req.body.summary,
      });
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/:fullTitle/redirections',
  [
    param('fullTitle')
      .trim()
      .custom(v => Article.validateFullTitle(v)),
  ],
  [
    sanitizeParam('fullTitle').trim(),
  ],
  middlewares.validate(),
  middlewares.checkBlock(),
  async (req, res, next) => {
    try {
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }

      const exists = await Article.existsWithRedirection({
        fullTitle: req.body.sourceFullTitle,
        caseSensitive: true,
      });
      if (exists) {
        return new Response.Conflict().send(res);
      }

      await article.addNewRedirection({
        ipAddress: req.ipAddress,
        fullTitle: req.body.sourceFullTitle,
        user: req.user,
      });
      return new Response.Created().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  '/:fullTitle/redirections',
  [
    param('fullTitle')
      .trim()
      .custom(v => Article.validateFullTitle(v)),
  ],
  [
    sanitizeParam('fullTitle').trim(),
  ],
  middlewares.validate(),
  middlewares.checkBlock(),
  async (req, res, next) => {
    try {
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      await article.deleteRedirection({
        ipAddress: req.ipAddress,
        fullTitle: req.query.source,
        user: req.user,
      });
      return new Response.Created().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

const discussionTopicsRouter = require('./discussion-topics');

router.use('/:fullTitle/discussion-topics', discussionTopicsRouter);

module.exports = router;
