'use strict';

const models = require('../../../models');

module.exports = fullTitle => models.Namespace.splitFullTitle(fullTitle);
