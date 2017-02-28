'use strict';

const express = require('express');
const router = express.Router();
const { User } = require(global.rootdir + '/models');
const Response = require(global.rootdir + '/src/responses');
const middlewares = require(global.rootdir + '/src/middlewares');

router.get('/', middlewares.userShouldHaveAnyRole(['admin']),
  async (req, res, next) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email']
      });
      new Response.Success({ users }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
