'use strict';

const express = require('express');
const router = express.Router();
const { sequelize, User } = require(global.rootdir + '/models');
const Response = require(global.rootdir + '/src/responses');
const middlewares = require(global.rootdir + '/src/middlewares');
const { GET_USER_LIST } = require(global.rootdir + '/src/specialPermissionConstants');

router.get('/',
  middlewares.permission(GET_USER_LIST),
  async (req, res, next) => {
    try {
      let where = {};
      if (req.query.startsWith) {
        where = {
          username: {
            // $like: `${sequelize.escape(req.query.startsWith)}%`
          }
        };
      }
      const users = await User.findAll({
        attributes: ['id', 'username', 'email'],
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
        username: req.body.username
      });
      new Response.Created({
        user: {
          email: user.email,
          username: user.username
        }
      }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
