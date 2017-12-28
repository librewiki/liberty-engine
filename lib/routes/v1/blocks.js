'use strict';

const express = require('express');

const router = express.Router();

const Response = require('../../responses');

const { param, query, body } = require('express-validator/check');
const { sanitizeParam, sanitizeQuery, sanitizeBody } = require('express-validator/filter');

const middlewares = require('../../middlewares');
const { BLOCK } = require('../../SpecialPermissions');

const { Block } = require('../../models');

router.post(
  '/',
  middlewares.permission(BLOCK),
  [
    body('ipStart')
      .optional()
      .trim()
      .isIP(),
    body('ipEnd')
      .optional()
      .trim()
      .isIP(),
    body('userId')
      .optional()
      .custom(v => Number.isInteger(v)),
    body('reason')
      .optional(),
    body('expiration')
      .optional({ nullable: true })
      .trim()
      .isAfter(),
  ],
  [
    sanitizeBody('ipStart').trim(),
    sanitizeBody('ipEnd').trim(),
    sanitizeBody('reason').trim(),
    sanitizeBody('expiration').trim().toDate(),
  ],
  middlewares.validate(),
  async ({
    body: {
      ipStart, ipEnd, userId, reason, expiration,
    },
  }, res, next) => {
    try {
      if (userId) {
        await Block.create({
          userId,
          reason,
          expiration,
        });
      } else {
        await Block.create({
          ipStart,
          ipEnd,
          reason,
          expiration,
        });
      }
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  '/',
  [
    query('containing')
      .optional()
      .trim()
      .isIP(),
  ],
  [
    sanitizeQuery('containing').trim(),
  ],
  async (req, res, next) => {
    try {
      const { containing } = req.query;
      const scopes = ['valid'];
      if (containing) {
        scopes.push({ method: ['containing', containing] });
      }
      const blocks = await Block.scope(scopes).findAll();
      return new Response.Success({ blocks }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  '/:id',
  [
    param('id')
      .trim()
      .isInt(),
  ],
  [
    sanitizeParam('id').trim().toInt(),
  ],
  async (req, res, next) => {
    try {
      const block = await Block.findById(req.params.id);
      await block.destroy();
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
      console.log('#!#!#!@#');
      let isBlocked = false;

      const ipBlockOptions = await Block.isBlockedIp(req.ipAddress);
      let userIsBlocked;

      if (req.user.isAnonymous) {
        userIsBlocked = false;
      } else {
        userIsBlocked = await Block.isBlockedUser(req.user);
        console.log(userIsBlocked);
      }

      if (userIsBlocked) {
        isBlocked = true;
      }

      if (ipBlockOptions && !(ipBlockOptions.anonymousOnly && !req.user.isAnonymous)) {
        isBlocked = true;
      }

      return new Response.Success({ isBlocked }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
