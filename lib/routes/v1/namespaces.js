'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });
const { Namespace } = require('../../models');
const Response = require('../../responses');
const middlewares = require('../../middlewares');
const { SET_NAMESPACE } = require('../../SpecialPermissions');

router.get(
  '/',
  (req, res, next) => {
    try {
      new Response.Success({ namespaces: Namespace.getAll() }).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/:namespaceId',
  middlewares.permission(SET_NAMESPACE),
  async (req, res, next) => {
    try {
      if (Number(req.params.namespaceId) === 0) {
        return new Response.BadRequest().send(res);
      }
      await Namespace.upsert({
        id: Number(req.params.namespaceId),
        name: req.body.name,
      });
      await Namespace.initialize();
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
