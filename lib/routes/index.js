'use strict';

const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.send(`hello! ${req.user.username}`);
});

module.exports = router;
