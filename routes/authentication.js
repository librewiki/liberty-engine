'use strict';

const express = require('express');
const router = express.Router();
const { User } = require('../models');
const Response = require('../src/responses');

router.post('/', async (req, res, next) => {
  try {
    const user = await User.findByUsername(req.body.username);
    if (!user) {
      return new Response.Unauthorized('User does not exist').send(res);
    }
    if (!await user.verifyPassword(req.body.password)) {
      return new Response.Unauthorized('Password does not match').send(res);
    }
    const token = await user.issueToken();
    return new Response.Success({ token }).send(res);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
