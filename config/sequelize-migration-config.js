'use strict';

const config = require('./config.json');

module.exports = {
  production: config.production ? {
    ...config.production.db,
    define: {
      freezeTableName: true,
    },
    operatorsAliases: false,
  } : {},
  development: config.development ? {
    ...config.development.db,
    define: {
      freezeTableName: true,
    },
    operatorsAliases: false,
  } : {},
  test: config.test ? {
    ...config.test.db,
    define: {
      freezeTableName: true,
    },
    operatorsAliases: false,
  } : {},
};
