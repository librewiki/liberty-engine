'use strict';

const express = require('express');
const { query } = require('express-validator/check');
const { sanitizeQuery } = require('express-validator/filter');
const {
  DiscussionTopic,
  DiscussionComment,
} = require('../../models');
const Response = require('../../responses');
const middlewares = require('../../middlewares');

const router = express.Router({ mergeParams: true });


router.get(
  '/',
  [
    query('limit')
      .optional()
      .trim()
      .isInt({ min: 1, max: 30 }),
    query('order')
      .optional()
      .trim()
      .isIn(['updatedAt']),
  ],
  [
    sanitizeQuery('limit').toInt(),
    sanitizeQuery('order').trim(),
  ],
  middlewares.validate(),
  async (req, res, next) => {
    try {
      const limit = req.query.limit || 10;
      const order = req.query.order === 'updatedAt' ? [['updatedAt', 'DESC']] : [];
      const discussionTopics = await DiscussionTopic.findAll({
        include: [
          {
            association: DiscussionTopic.associations.article,
            attributes: ['fullTitle', 'id', 'title', 'namespaceId'],
          },
        ],
        order,
        limit,
      });
      return new Response.Success({ discussionTopics }).send(res);
    } catch (err) {
      return next(err);
    }
  },
);

/* GET discussion-topics/:topicId */
router.get(
  '/:topicId',
  async (req, res, next) => {
    try {
      const discussionTopic = await DiscussionTopic.findByPk(req.params.topicId, {
        include: [
          {
            association: DiscussionTopic.associations.comments,
            include: [DiscussionComment.associations.author, DiscussionComment.associations.hider],
          },
          DiscussionTopic.associations.article,
        ],
      });
      if (!discussionTopic) {
        return new Response.ResourceNotFound().send(res);
      }
      const comments = await Promise.all(
        discussionTopic.comments.map(comment => comment.getPublicObject()),
      );
      const result = {
        id: discussionTopic.id,
        title: discussionTopic.title,
        status: discussionTopic.status,
        comments,
        article: {
          fullTitle: discussionTopic.article.fullTitle,
        },
      };
      return new Response.Success({ discussionTopic: result }).send(res);
    } catch (err) {
      return next(err);
    }
  },
);

router.post(
  '/:topicId/comments',
  async (req, res, next) => {
    try {
      const discussionTopic = await DiscussionTopic.findByPk(req.params.topicId, {
        include: [
          DiscussionTopic.associations.comments,
          DiscussionTopic.associations.article,
        ],
      });
      if (!discussionTopic) {
        return new Response.ResourceNotFound().send(res);
      }
      await DiscussionComment.createNew({
        topic: discussionTopic,
        ipAddress: req.ipAddress,
        author: req.user,
        wikitext: req.body.wikitext,
      });
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
