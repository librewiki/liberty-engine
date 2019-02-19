'use strict';

const express = require('express');
const { param, body } = require('express-validator/check');
const { sanitizeParam } = require('express-validator/filter');
const { User, Role } = require('../../../models');
const Response = require('../../../responses');
const middlewares = require('../../../middlewares');
const { GRANT_REVOKE_ROLE } = require('../../../SpecialPermissions');

const router = express.Router({ mergeParams: true });

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
      const user = await User.findByPk(req.params.userId, {
        include: [{
          association: User.associations.roles,
        }],
      });
      if (!user) {
        return new Response.ResourceNotFound().send(res);
      }
      return new Response.Success({ roles: user.roles }).send(res);
    } catch (err) {
      return next(err);
    }
  },
);

/* PUT /users/:userId/roles */
router.put(
  '/',
  middlewares.permission(GRANT_REVOKE_ROLE),
  [
    param('userId').trim().isInt(),
    body('roleIds.*').custom(v => Number.isInteger(v)),
  ],
  [
    sanitizeParam('userId').trim().toInt(),
  ],
  middlewares.validate(),
  async ({ params: { userId }, body: { roleIds } }, res, next) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return new Response.ResourceNotFound().send(res);
      }
      if (roleIds.includes(Role.Known.anonymous.id) || !roleIds.includes(Role.Known.loggedIn.id)) {
        return new Response.BadRequest().send(res);
      }
      await user.setRoles(roleIds);
      return new Response.Success({ roles: user.roles }).send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
