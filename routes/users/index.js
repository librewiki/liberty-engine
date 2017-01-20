'use strict';

const express = require('express');
const router = express.Router();
const { User } = require('../../models');

//@TODO add auth.
router.get('/', (req, res, next) => {
  return User.findAll()
  .then((users) => {
    const result = users.map((user) => {
      return {
        id: user.id,
        username: user.username,
        email: user.email
      };
    });
    res.status(200).json(result);
  })
  .catch((err) => {
    res.status(500).json({
      message: 'Internal Server Error'
    });
  });
});

module.exports = router;
