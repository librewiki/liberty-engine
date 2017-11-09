'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });
const { User } = require('../../../models');
const Response = require('../../../responses');
const middlewares = require('../../../middlewares');
const { GET_USER_LIST } = require('../../../SpecialPermissions');
const { query, body } = require('express-validator/check');
const { sanitizeQuery, sanitizeBody } = require('express-validator/filter');
const { Op } = require('sequelize');

router.get(
  '/',
  [
    query('startingWith')
      .optional()
      .trim()
      .custom(v => User.validateUsername(v)),
    query('username')
      .optional()
      .trim()
      .custom(v => User.validateUsername(v)),
    query('limit')
      .optional()
      .trim()
      .isInt({ min: 1, max: 100 }),
  ],
  [
    sanitizeQuery('startingWith').trim(),
    sanitizeQuery('username').trim(),
    sanitizeQuery('limit').trim().toInt(),
  ],
  middlewares.validate(),
  middlewares.checkBlock({ noUserCreation: true }),
  middlewares.permission(GET_USER_LIST),
  async (req, res, next) => {
    try {
      const limit = req.query.limit || 10;
      let where = {};
      const { startingWith, username } = req.query;
      if (startingWith) {
        where = {
          username: {
            // @TODO escape %, _
            [Op.like]: `${startingWith}%`,
          },
        };
      }
      if (username) {
        where = {
          username,
        };
      }
      console.log(where);
      const users = await User.findAll({
        attributes: ['id', 'username', 'email'],
        include: [{
          association: User.associations.roles,
        }],
        where,
        limit,
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
      .custom(v => User.validateUsername(v)),
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
  middlewares.validate(),
  middlewares.checkBlock({ noUserCreation: true }),
  async (req, res, next) => {
    try {
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
