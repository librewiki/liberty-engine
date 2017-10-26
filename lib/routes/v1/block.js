'use strict';

const express = require('express');

const router = express.Router();

const Response = require('../../responses');

const { body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const middlewares = require('../../middlewares');
const { BLOCK } = require('../../specialPermissionConstants');

const { Block } = require('../../models');

router.post(
  '/',
  middlewares.permission(BLOCK),
  [
    body('ipStart')
      .trim()
      .isIP(),
    body('ipEnd')
      .trim()
      .isIP(),
    body('reason')
      .optional(),
  ],
  [
    sanitizeBody('ip').trim(),
    sanitizeBody('reason').trim(),
  ],
  middlewares.validate(),
  async (req, res, next) => {
    try {
      await Block.create({
        ipStart: req.body.ipStart,
        ipEnd: req.body.ipEnd,
        reason: req.body.reason,
      });
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  '/check',
  async (req, res, next) => {
    try {
      const isBlockedIp = !!await Block.isBlockedIp(req.ipAddress);
      return new Response.Success({ isBlockedIp }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
