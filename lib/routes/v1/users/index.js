'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });
const { User } = require('../../../models');
const Response = require('../../../responses');
const middlewares = require('../../../middlewares');
const { GET_USER_LIST } = require('../../../specialPermissionConstants');
const {
  body, validationResult,
} = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

router.get(
  '/',
  middlewares.permission(GET_USER_LIST),
  async (req, res, next) => {
    try {
      let where = {};
      if (req.query.startsWith) {
        where = {
          username: {
            $like: `${req.query.startsWith}%`,
          },
        };
      }
      if (req.query.username) {
        where = {
          username: req.query.username,
        };
      }
      const users = await User.findAll({
        attributes: ['id', 'username', 'email'],
        include: [{
          association: User.associations.roles,
        }],
        where,
      });
      new Response.Success({ users }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  [
    body('username')
      .trim()
      .custom((v) => {
        if (!User.validateUsername(v)) {
          throw new Error();
        }
        return v;
      }),
    body('password')
      .trim()
      .isLength({ min: 6 }),
    body('email')
      .trim()
      .isEmail()
      .isLength({ max: 128 }),
  ],
  [
    sanitizeBody('fullTitle').trim(),
    sanitizeBody('password').trim(),
    sanitizeBody('email').trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return new Response.BadRequest({ errors: errors.array() }).send(res);
      }
      const user = await User.signUp({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
      });
      return new Response.Created({
        user: {
          email: user.email,
          username: user.username,
        },
      }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

const rolesRouter = require('./roles');

router.use('/:userId/roles', rolesRouter);

module.exports = router;
