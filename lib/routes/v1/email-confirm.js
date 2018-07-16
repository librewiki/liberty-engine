'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });
const Response = require('../../responses');
const models = require('../../models');

router.get(
  '/',
  async (req, res, next) => {
    try {
      const user = await models.User.findByUsername(req.query.username);
      if (!user) {
        new Response.BadRequest().send(res);
      }
      if (new Date() < user.confirmCodeExpiry && user.confirmCode === req.query.code) {
        user.update({
          emailConfirmed: true,
          confirmCode: null,
          confirmCodeExpiry: null,
        });
        new Response.Success().send(res);
      } else {
        new Response.BadRequest().send(res);
      }
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
