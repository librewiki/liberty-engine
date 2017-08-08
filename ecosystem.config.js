'use strict';

module.exports = {
  apps: [
    {
      name: 'LibertyEngine',
      script: 'bin/www',
      env: {
        COMMON_VARIABLE: 'true',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
