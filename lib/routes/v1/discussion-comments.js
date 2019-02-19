'use strict';

const express = require('express');
const { param, body } = require('express-validator/check');
const { sanitizeParam, sanitizeBody } = require('express-validator/filter');
const {
  DiscussionComment,
} = require('../../models');
const Response = require('../../responses');
const middlewares = require('../../middlewares');
const { SET_DISCUSSION_STATUS } = require('../../SpecialPermissions');

const router = express.Router({ mergeParams: true });

/*
 * hide or unhide a comment
 * GET discussion-comment/:commentId
 */
router.put(
  '/:commentId/status',
  middlewares.permission(SET_DISCUSSION_STATUS),
  [
    param('commentId').trim().isInt().custom(v => v > 0),
    body('status').trim().isIn(['PUBLIC', 'HIDDEN']),
  ],
  [
    sanitizeParam('commentId').trim().toInt(),
    sanitizeBody('status').trim(),
  ],
  middlewares.validate(),
  async ({ params: { commentId }, body: { status }, user }, res, next) => {
    try {
      const comment = await DiscussionComment.findByPk(commentId);
      if (!comment) {
        return new Response.ResourceNotFound().send(res);
      }
      if (status === 'HIDDEN') {
        await comment.hide({ hider: user });
      } else {
        await comment.unhide();
      }
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
