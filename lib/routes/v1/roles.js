'use strict';

const express = require('express');
const { param, body } = require('express-validator/check');
const { sanitizeParam, sanitizeBody } = require('express-validator/filter');

const {
  sequelize,
  Role,
  NamespacePermission,
  SpecialPermission,
  initialize: initializeModels,
} = require('../../models');
const Response = require('../../responses');
const middlewares = require('../../middlewares');
const {
  ADD_REMOVE_ROLE,
  GET_ROLE,
  GET_ROLE_LIST,
  SET_PERMISSION_OF_ROLE,
} = require('../../SpecialPermissions');
const SpecialPermissions = require('../../SpecialPermissions');

const router = express.Router({ mergeParams: true });

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
  },
);

router.post(
  '/',
  middlewares.permission(ADD_REMOVE_ROLE),
  [
    body('role.name').trim().isLength({ min: 1, max: 127 }),
  ],
  [
    sanitizeBody('role.name').trim(),
  ],
  middlewares.validate(),
  async ({ body: { role } }, res, next) => {
    try {
      const newRole = await Role.create({
        name: role.name,
      });
      await initializeModels();
      return new Response.Created({ role: newRole }).send(res);
    } catch (err) {
      return next(err);
    }
  },
);

router.get(
  '/:roleId',
  middlewares.permission(GET_ROLE),
  async (req, res, next) => {
    try {
      const role = await Role.findByPk(req.params.roleId, {
        include: [NamespacePermission, SpecialPermission],
      });
      new Response.Success({ role }).send(res);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:roleId',
  middlewares.permission(GET_ROLE),
  async (req, res, next) => {
    try {
      const role = await Role.findByPk(req.params.roleId);
      await role.remove();
      new Response.Success().send(res);
    } catch (err) {
      next(err);
    }
  },
);

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
          .filter(
            p => p.readable !== false
              || p.creatable !== false
              || p.editable !== false
              || p.renamable !== false
              || p.deletable !== false,
          );
        await NamespacePermission.destroy({ where: { roleId }, transaction: t });
        await NamespacePermission.bulkCreate(permissionsToInsert, { transaction: t });
        return new Response.Success().send(res);
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.put(
  '/:roleId/special-permissions',
  middlewares.permission(SET_PERMISSION_OF_ROLE),
  [
    param('roleId')
      .trim()
      .isInt(),
    body('specialPermissions.*')
      .trim()
      .custom(v => SpecialPermissions[v] !== undefined),
  ],
  [
    sanitizeParam('roleId').trim().toInt(),
    sanitizeBody('specialPermissions.*').trim(),
  ],
  middlewares.validate(),
  async ({ params: { roleId }, body: { specialPermissions } }, res, next) => {
    try {
      const toSet = specialPermissions.map(p => SpecialPermission.nameKeyMap.get(p));
      const role = await Role.findByPk(roleId);
      await role.setSpecialPermissions(toSet);
      await initializeModels();
      return new Response.Success().send(res);
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
