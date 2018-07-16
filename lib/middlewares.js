'use strict';

const { validationResult } = require('express-validator/check');
const Response = require('./responses');
const { Block } = require('./models');

function permission(permission) {
  return async function f(req, res, next) {
    try {
      if (await req.user.hasSpecialPermissionTo(permission)) {
        next();
      } else {
        new Response.Unauthorized().send(res);
      }
    } catch (err) {
      next(err);
    }
  };
}

function userShouldHaveAnyRole(roleNames) {
  return async function f(req, res, next) {
    try {
      if (await req.user.hasAnyRole(roleNames)) {
        next();
      } else {
        new Response.Unauthorized().send(res);
      }
    } catch (err) {
      next(err);
    }
  };
}

function validate() {
  return function f(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return new Response.BadRequest({ errors: errors.array() }).send(res);
    }
    return next();
  };
}

function checkBlock({ noUserCreation = null } = {}) {
  return async function f(req, res, next) {
    const ipBlockOptions = await Block.isBlockedIp(req.ipAddress);
    let userIsBlocked;

    if (req.user.isAnonymous) {
      userIsBlocked = false;
    } else {
      userIsBlocked = await Block.isBlockedUser(req.user);
    }

    if (userIsBlocked) {
      return new Response.Blocked().send(res);
    }

    if (ipBlockOptions) {
      if (noUserCreation !== null && ipBlockOptions.noUserCreation !== noUserCreation) {
        return next();
      }

      if (ipBlockOptions.anonymousOnly && !req.user.isAnonymous) {
        return next();
      }

      return new Response.Blocked().send(res);
    }

    return next();
  };
}

module.exports.permission = permission;
module.exports.userShouldHaveAnyRole = userShouldHaveAnyRole;
module.exports.validate = validate;
module.exports.checkBlock = checkBlock;
