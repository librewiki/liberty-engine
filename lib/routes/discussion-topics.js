'use strict';

const express = require('express');

const {
  DiscussionTopic,
  DiscussionComment,
} = require('../models');
const Response = require('../responses');

const router = express.Router();

/* GET discussion-topics/:topicId */
router.get('/:topicId',
  async (req, res, next) => {
    try {
      const discussionTopic = await DiscussionTopic.findById(req.params.topicId, {
        include: [
          {
            association: DiscussionTopic.associations.comments,
            include: [DiscussionComment.associations.author],
          },
          DiscussionTopic.associations.article,
        ],
      });
      if (!discussionTopic) {
        return new Response.ResourceNotFound().send(res);
      }
      const comments = await Promise.all(
        discussionTopic.comments.map(comment => comment.getPublicObject())
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
  }
);

router.post('/:topicId/comments',
  async (req, res, next) => {
    try {
      const discussionTopic = await DiscussionTopic.findById(req.params.topicId, {
        include: [
          DiscussionTopic.associations.comments,
          DiscussionTopic.associations.article,
        ],
      });
      if (!discussionTopic) {
        return new Response.ResourceNotFound().send(res);
      }
      await DiscussionComment.createNew({
        topicId: discussionTopic.id,
        ipAddress: req.ipAddress,
        author: req.user,
        wikitext: req.body.wikitext,
      });
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
