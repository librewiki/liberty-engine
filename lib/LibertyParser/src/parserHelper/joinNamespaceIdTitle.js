'use strict';

const models = require('../../../models');

module.exports = (namespaceId, title) => models.Namespace.joinNamespaceIdTitle(namespaceId, title);
