'use strict';
const Response = require('./responses');

function userShouldHaveAnyRole(roleNames) {
  return async function(req, res, next) {
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

module.exports.userShouldHaveAnyRole = userShouldHaveAnyRole;
