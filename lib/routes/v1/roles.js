'use strict';

const express = require('express');

const router = express.Router();

const { sequelize, Role, NamespacePermission } = require('../../models');
const Response = require('../../responses');
const middlewares = require('../../middlewares');
const { GET_ROLE, GET_ROLE_LIST, SET_PERMISSION_OF_ROLE } = require('../../SpecialPermissions');
const { param, query, body } = require('express-validator/check');
const { sanitizeParam, sanitizeQuery, sanitizeBody } = require('express-validator/filter');

router.get(
  '/',
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

router.get(
  '/:roleId',
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
// namespaceId: namespace.id,
// namespaceName: namespace.name,
// readable: false,
// creatable: false,
// editable: false,
// renamable: false,
// deletable: false
router.put(
  '/:roleId/namespace-permissions',
  middlewares.permission(SET_PERMISSION_OF_ROLE),
  [
    param('roleId')
      .trim()
      .isInt(),
    body('namespacePermissions.*.namespaceId')
      .custom(v => Number.isInteger(v)),
    body('namespacePermissions.*.readable')
      .optional()
      .custom(v => [true, false].includes(v)),
    body('namespacePermissions.*.creatable')
      .optional()
      .custom(v => [true, false].includes(v)),
    body('namespacePermissions.*.editable')
      .optional()
      .custom(v => [true, false].includes(v)),
    body('namespacePermissions.*.renamable')
      .optional()
      .custom(v => [true, false].includes(v)),
    body('namespacePermissions.*.deletable')
      .optional()
      .custom(v => [true, false].includes(v)),
  ],
  [
    sanitizeParam('roleId').trim().toInt(),
  ],
  middlewares.validate(),
  async ({ params: { roleId }, body: { namespacePermissions } }, res, next) => {
    try {
      return sequelize.transaction(async (t) => {
        const permissionsToInsert = namespacePermissions
          .map(p => ({
            roleId,
            namespaceId: p.namespaceId,
            readable: p.readable || false,
            creatable: p.creatable || false,
            editable: p.editable || false,
            renamable: p.renamable || false,
            deletable: p.deletable || false,
          }))
          .filter(p =>
            p.readable !== false ||
            p.creatable !== false ||
            p.editable !== false ||
            p.renamable !== false ||
            p.deletable !== false);
        await NamespacePermission.destroy({ where: { roleId }, transaction: t });
        await NamespacePermission.bulkCreate(permissionsToInsert, { transaction: t });
        return new Response.Success().send(res);
      });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
