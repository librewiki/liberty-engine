'use strict';

const express = require('express');
const {
  Article,
  DiscussionTopic,
} = require('../../../models');
const Response = require('../../../responses');
const middlewares = require('../../../middlewares');

const router = express.Router({ mergeParams: true });

/* GET /articles/:fullTitle/discussion-topics */
router.get(
  '/',
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
  },
);

/* POST /articles/:fullTitle/discussion-topics */
router.post(
  '/',
  middlewares.checkBlock(),
  async (req, res, next) => {
    try {
      const article = await Article.findByFullTitle(req.params.fullTitle);
      if (!article) {
        return new Response.ResourceNotFound().send(res);
      }
      if (!req.body.title || !req.body.wikitext) {
        return new Response.BadRequest().send(res);
      }
      await DiscussionTopic.createNew({
        ipAddress: req.ipAddress,
        title: req.body.title,
        author: req.user,
        wikitext: req.body.wikitext,
        article,
      });
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
