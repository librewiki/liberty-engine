'use strict';

const express = require('express');
const { body } = require('express-validator/check');
const { User } = require('../../models');
const Response = require('../../responses');
const middlewares = require('../../middlewares');

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  [
    body('username').exists(),
    body('password').exists(),
  ],
  middlewares.validate(),
  async ({ body: { username, password } }, res, next) => {
    try {
      const user = await User.findByUsername(username);
      if (!user) {
        return new Response.Unauthorized('User does not exist').send(res);
      }
      if (!await user.verifyPassword(password)) {
        return new Response.Unauthorized('Password does not match').send(res);
      }
      const [token, refreshToken] = await Promise.all(
        [user.issueToken(), user.issueRefreshToken()],
      );
      return new Response.Success({ token, refreshToken }).send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
