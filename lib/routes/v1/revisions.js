'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

const {
  param, query, validationResult,
} = require('express-validator/check');
const { sanitizeParam, sanitizeQuery } = require('express-validator/filter');

const { Revision } = require('../../models');
const Response = require('../../responses');

router.get(
  '/',
  [
    query('limit')
      .optional()
      .trim()
      .isInt({ min: 1, max: 50 }),
    query('offset')
      .optional()
      .trim()
      .isInt({ min: 0 }),
    query('distinct')
      .optional(),
  ],
  [
    sanitizeQuery('limit').trim().toInt(),
    sanitizeQuery('offset').trim().toInt(),
    sanitizeQuery('distinct').trim().toBoolean(), // Everything except for '0', 'false' and '' returns true
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return new Response.BadRequest({ errors: errors.array() }).send(res);
      }
      const limit = req.query.limit || 10;
      const offset = req.query.offset || 0;
      const distinct = req.query.distinct || false;
      let revisions;
      if (distinct) {
        revisions = Revision.getRecentDistinctRevisions({
          limit,
        });
      } else {
        revisions = await Revision.findAll({
          include: [Revision.associations.author, Revision.associations.article],
          limit,
          offset,
          order: [['id', 'DESC']],
        });
      }
      const result = revisions.map((revision) => {
        if (!revision.article) {
          return null;
        }
        return {
          id: revision.id,
          changedLength: revision.changedLength,
          createdAt: revision.createdAt,
          articleFullTitle: revision.article.fullTitle,
          summary: revision.summary,
          authorName: revision.author ? revision.author.username : null,
          ipAddress: revision.author ? null : revision.ipAddress,
        };
      }).filter(r => r);
      return new Response.Success({ revisions: result }).send(res);
    } catch (err) {
      return next(err);
    }
  },
);

router.get(
  '/:revisionId',
  [
    param('revisionId')
      .trim()
      .isInt(),
  ],
  [
    sanitizeParam('revisionId').trim().toInt(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return new Response.BadRequest({ errors: errors.array() }).send(res);
      }
      const revision = await Revision.findByPk(req.params.revisionId, {
        include: [
          Revision.associations.author,
          Revision.associations.wikitext,
        ],
      });
      if (!revision) {
        return new Response.ResourceNotFound().send(res);
      }
      return new Response.Success({
        revision: {
          id: revision.id,
          changedLength: revision.changedLength,
          createdAt: revision.createdAt,
          summary: revision.summary,
          authorName: revision.author ? revision.author.username : null,
          ipAddress: revision.author ? null : revision.ipAddress,
          wikitext: revision.wikitext.text,
        },
      }).send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
