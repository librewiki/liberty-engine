'use strict';

const express = require('express');

const {
  Article,
} = require('../../models');

const Response = require('../../src/responses');

const router = express.Router({ mergeParams: true });

/* /articles/full-title/discussion-topics */
router.get('/',
  async (req, res, next) => {
    try {
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      const discussionTopics = await article.getDiscussionTopics();
      return new Response.Success({ discussionTopics }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
