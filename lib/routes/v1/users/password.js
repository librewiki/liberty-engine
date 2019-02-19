'use strict';

const express = require('express');
const { param, body } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const { User } = require('../../../models');
const Response = require('../../../responses');
const middlewares = require('../../../middlewares');

const router = express.Router({ mergeParams: true });

/* PUT /users/:userId/password */
router.put(
  '/',
  [
    param('userId').trim().isInt().custom(v => v > 0),
    body('password').trim().isLength({ min: 6 }),
    body('oldPassword').trim(),
  ],
  [
    sanitizeParam('userId').trim().toInt(),
    sanitizeParam('password').trim(),
    sanitizeParam('oldPassword').trim(),
  ],
  middlewares.validate(),
  async ({ user, params: { userId }, body: { password, oldPassword } }, res, next) => {
    try {
      const userFound = await User.findByPk(userId);
      if (!userFound) {
        return new Response.BadRequest().send(res);
      }
      if (
        user.isAnnonymous
        || userFound.id !== user.id
        || !await user.verifyPassword(oldPassword)
      ) {
        return new Response.Unauthorized().send(res);
      }
      await user.update({ password });
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
