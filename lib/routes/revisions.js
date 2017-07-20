'use strict';

const express = require('express');

const router = express.Router();

const { Revision } = require('../models');
const Response = require('../responses');

router.get('/',
  async (req, res, next) => {
    try {
      let limit = parseInt(req.query.limit, 10) || 10;
      const offset = req.query.offset || 0;
      const distinct = req.query.distinct === '1';
      if (limit > 50) {
        limit = 50;
      }
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
      const result = revisions.map(revision => ({
        id: revision.id,
        changedLength: revision.changedLength,
        createdAt: revision.createdAt,
        articleFullTitle: revision.article.fullTitle,
        summary: revision.summary,
        authorName: revision.author ? revision.author.username : null,
        ipAddress: revision.author ? null : revision.ipAddress,
      }));
      new Response.Success({ revisions: result }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:revisionId',
  async (req, res, next) => {
    try {
      const revision = await Revision.findById(req.params.revisionId, {
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
  }
);

module.exports = router;
