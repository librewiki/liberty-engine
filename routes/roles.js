'use strict';

const express = require('express');

const router = express.Router();

const { Role } = require('../models');
const Response = require('../src/responses');
const middlewares = require('../src/middlewares');
const { GET_ROLE, GET_ROLE_LIST } = require('../src/specialPermissionConstants');

router.get('/',
  middlewares.permission(GET_ROLE_LIST),
  async (req, res, next) => {
    try {
      const roles = await Role.findAll();
      new Response.Success({ roles }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:roleId',
  middlewares.permission(GET_ROLE),
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
