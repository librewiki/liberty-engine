'use strict';

const express = require('express');
const router = express.Router();

const { Role } = require(global.rootdir + '/models');
const Response = require(global.rootdir + '/src/responses');
const middlewares = require(global.rootdir + '/src/middlewares');

router.get('/', middlewares.userShouldHaveAnyRole(['admin']),
  async (req, res, next) => {
    try {
      const roles = await Role.findAll();
      new Response.Success({ roles }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:roleId', middlewares.userShouldHaveAnyRole(['admin']),
  async (req, res, next) => {
    try {
      const role = await Role.findById(req.params.roleId);
      new Response.Success({ role }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
