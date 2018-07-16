'use strict';

const colors = require('colors/safe');

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
    console.error(err);
    process.exit(1);
  });
