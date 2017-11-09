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
      .trim()
      .isIP(),
    body('ipEnd')
      .trim()
      .isIP(),
    body('reason')
      .optional(),
    body('expiration')
      .optional({ nullable: true })
      .trim()
      .isAfter(),
  ],
  [
    sanitizeBody('ip').trim(),
    sanitizeBody('reason').trim(),
    sanitizeBody('expiration').trim().toDate(),
  ],
  middlewares.validate(),
  async (req, res, next) => {
    try {
      await Block.create({
        ipStart: req.body.ipStart,
        ipEnd: req.body.ipEnd,
        reason: req.body.reason,
        expiration: req.body.expiration,
      });
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
      const isBlockedIp = !!await Block.isBlockedIp(req.ipAddress);
      return new Response.Success({ isBlockedIp }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
