'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });
const { User, Role } = require('../../../models');
const Response = require('../../../responses');
const middlewares = require('../../../middlewares');
const { GRANT_REVOKE_ROLE } = require('../../../SpecialPermissions');
const { param, body } = require('express-validator/check');
const { sanitizeParam, sanitizeBody } = require('express-validator/filter');

/* GET /users/:userId/roles */
router.get(
  '/',
  [
    param('userId').trim().isInt(),
  ],
  [
    sanitizeParam('userId').trim().toInt(),
  ],
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
  [
    param('userId').trim().isInt(),
    body('roleIds.*').custom(v => Number.isInteger(v)),
  ],
  [
    sanitizeParam('userId').trim().toInt(),
  ],
  middlewares.validate(),
  middlewares.permission(GRANT_REVOKE_ROLE),
  async ({ params: { userId }, body: { roleIds } }, res, next) => {
    try {
      const user = await User.findById(userId);
      if (roleIds.includes(Role.Known.anonymous.id) || !roleIds.includes(Role.Known.loggedIn.id)) {
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
