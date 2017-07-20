'use strict';

const express = require('express');

const router = express.Router();
const { User } = require('../models');
const Response = require('../responses');

router.post('/',
  async (req, res, next) => {
    try {
      const user = await User.findByUsername(req.body.username);
      if (!user) {
        return new Response.Unauthorized('User does not exist').send(res);
      }
      if (!await user.verifyPassword(req.body.password)) {
        return new Response.Unauthorized('Password does not match').send(res);
      }
      const [token, refreshToken] =
        await Promise.all([user.issueToken(), user.issueRefreshToken()]);
      return new Response.Success({ token, refreshToken }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.post('/refresh',
  async (req, res, next) => {
    try {
      const refreshToken = req.body.refreshToken;
      if (!refreshToken) {
        return new Response.Unauthorized('REFRESH_TOKEN_NEEDED', 'Refresh token does not exist').send(res);
      }
      const decoded = await User.verifyToken(refreshToken);
      if (decoded.type !== 'REFRESH') {
        return new Response.Unauthorized('INVALID_TOKEN_TYPE', 'Bad token type').send(res);
      }
      const user = await User.findById(decoded.id);
      const [token, newRefreshToken] =
        await Promise.all([user.issueToken(), user.issueRefreshToken()]);
      return new Response.Success({ token, refreshToken: newRefreshToken }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
