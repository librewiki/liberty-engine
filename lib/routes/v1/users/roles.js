'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });
const { User } = require('../../../models');
const Response = require('../../../responses');
const middlewares = require('../../../middlewares');
const { SET_USER_ROLE } = require('../../../SpecialPermissions');

/* GET /users/:userId/roles */
router.get(
  '/',
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId, {
        include: [{
          association: User.associations.roles,
        }],
      });
      new Response.Success({ roles: user.roles }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

/* PUT /users/:userId/roles */
router.put(
  '/',
  middlewares.permission(SET_USER_ROLE),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId);
      const roleIds = req.body.roleIds;
      if (!roleIds) {
        return new Response.BadRequest().send(res);
      }
      await user.setRoles(roleIds);
      return new Response.Success({ roles: user.roles }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
