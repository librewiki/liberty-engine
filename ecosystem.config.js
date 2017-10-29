'use strict';

module.exports = {
  apps: [{
    name: 'LibertyEngine:API',
    script: './bin/www',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
  }, {
    name: 'LibertyEngine:View',
    script: './view/node_modules/.bin/nuxt',
    args: 'start view',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
