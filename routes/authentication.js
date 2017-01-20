'use strict';

const express = require('express');
const router = express.Router();
const { User } = require('../models');
const Response = require('../src/responses');

router.post('/', (req, res, next) => {
  return Promise.resolve()
  .then(() => {
    return User.findByUsername(req.body.username);
  })
  .then((user) => {
    if (!user) {
      let e = new Error('User does not exist');
      e.name = 'UserNotExistError';
      throw e;
    }
    return user.verifyPassword(req.body.password)
    .then((isCorrectPassword) => {
      if (isCorrectPassword) {
        return user.issueToken();
      } else {
        let e = new Error('Password does not match');
        e.name = 'IncorrectPasswordError';
        throw e;
      }
    });
  })
  .then((token) => {
    new Response.Success({
      token: token
    })
    .send(res);
  })
  .catch((err) => {
    switch (err.name) {
      case 'UserNotExistError':
        new Response.Unauthorized('User does not exist').send(res);
        break;
      case 'IncorrectPasswordError':
        new Response.Unauthorized('Password does not match').send(res);
        break;
      default:
        new Response.ServerError().send(res);
    }
  });
});

module.exports = router;
