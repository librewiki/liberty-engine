'use strict';

const express = require('express');

const router = express.Router();

const { sequelize, Role, NamespacePermission } = require('../models');
const Response = require('../responses');
const middlewares = require('../middlewares');
const { GET_ROLE, GET_ROLE_LIST, SET_PERMISSION_OF_ROLE } = require('../specialPermissionConstants');

router.get('/',
  middlewares.permission(GET_ROLE_LIST),
  async (req, res, next) => {
    try {
      const roles = await Role.findAll();
      new Response.Success({ roles }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:roleId',
  middlewares.permission(GET_ROLE),
  async (req, res, next) => {
    try {
      const role = await Role.findById(req.params.roleId, {
        include: [NamespacePermission],
      });
      new Response.Success({ role }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:roleId/namespace-permissions',
  middlewares.permission(SET_PERMISSION_OF_ROLE),
  async (req, res, next) => {
    try {
      if (Number(req.params.roleId) === 0) {
        return new Response.BadRequest().send(res);
      }
      const namespaceIds = Object.keys(req.body.namespacePermissions).map(key => Number(key));
      await sequelize.transaction(async (transaction) => {
        await Promise.all(namespaceIds.map((namespaceId) => {
          const permissions = req.body.namespacePermissions[namespaceId];
          return NamespacePermission.upsert({
            namespaceId,
            roleId: Number(req.params.roleId),
            readable: permissions.readable,
            creatable: permissions.creatable,
            editable: permissions.editable,
            renamable: permissions.renamable,
          }, { transaction });
        }));
      });
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
