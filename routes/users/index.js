'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });
const { User } = require('../../models');
const Response = require('../../src/responses');
const middlewares = require('../../src/middlewares');
const { GET_USER_LIST } = require('../../src/specialPermissionConstants');

router.get('/',
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

router.post('/',
  async (req, res, next) => {
    try {
      const user = await User.signUp({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
      });
      new Response.Created({
        user: {
          email: user.email,
          username: user.username,
        },
      }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

const rolesRouter = require('./roles');

router.use('/:userId/roles', rolesRouter);

module.exports = router;
