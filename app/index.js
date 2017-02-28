'use strict';

const express = require('express');
const app = express();
module.exports = app;

const setApp = require('./set-app');
setApp(express, app)
.catch((err) => {
  console.log(err);
  process.exit(1);
});
