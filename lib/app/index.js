'use strict';

const colors = require('colors/safe');
require('./set-i18n');

const express = require('express');

const app = express();
module.exports = app;

const setApp = require('./set-app');

setApp(express, app)
  .then(() => {
    console.log(colors.green('Successfully started.'));
    if (process.send) {
      process.send('server on');
    }
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
