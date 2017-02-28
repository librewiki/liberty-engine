'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const models = require(global.rootdir + '/models');

models.initialize({ force: true })
.then(() => {
  return models.setDefaultInstances();
})
.catch((err) => {
  console.log(err);
  process.exit(1);
});
const i18next = require('i18next');
i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  ns: [
    'LibertyParser'
  ],
  resources: {
    en: require(global.rootdir + '/i18n/en.json'),
    ko: require(global.rootdir + '/i18n/ko.json')
  }
});

const app = express();

app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(async (req, res, next) => {
  try {
    req.ipAddress = req.ip.replace(/^::ffff:/, '');
    const token = req.headers['x-access-token'];
    if (token) {
      const decoded = await models.User.verifyToken(token);
      const user = await models.User.findById(decoded.id);
      req.user = user;
      next();
    } else {
      req.user = models.User.anonymous;
      next();
    }
  } catch (err) {
    next(err);
  }
});

app.use((req, res, next) => {
  req.queryData = req.queryData || {};
  if (req.query.fields) {
    req.queryData.fields = req.query.fields.split(',');
  } else {
    req.queryData.fields = [];
  }
  next();
});

app.use('/swagger\.json', express.static(path.join(global.rootdir, './docs/swagger.json')));
app.use('/swagger-ui', express.static(path.join(global.rootdir, './node_modules/swagger-ui/dist')));
app.use('/swagger', (req, res) => {
  res.redirect('/swagger-ui?url=/swagger.json');
});

const setRoutes = require('./set-routes');
setRoutes(app);

const Response = require(global.rootdir + '/src/responses');


// catch 404 and forward to error handler
app.use((req, res, next) => {
  new Response.ApiNotFound().send(res);
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err);
  if (req.app.get('env') === 'production') {
    res.send({
      type: 'error',
      message: 'Internal Server Error'
    });
  } else {
    res.send({
      type: 'error',
      message: err.message || 'Internal Server Error',
      stackTrace: err.stack
    });
  }
});

module.exports = app;
