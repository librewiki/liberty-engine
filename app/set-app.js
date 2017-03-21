'use strict';

module.exports = async function(express, app) {
  const models = require(global.rootdir + '/models');
  await models.initialize({ force: true });
  await models.setDefaultInstances();

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

  const logger = require('morgan');
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const helmet = require('helmet');

  app.use(helmet());
  app.use(logger('dev'));
  app.use(bodyParser.json({ limit: '10mb' }));
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

  const setRoutes = require('./set-routes');
  setRoutes(express, app);

  const Response = require(global.rootdir + '/src/responses');


  // catch 404
  app.use((req, res, next) => {
    new Response.ApiNotFound().send(res);
  });

  // error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    console.log(err);
    if (req.app.get('env') === 'production') {
      res.json({
        type: 'error',
        message: 'Internal Server Error'
      });
    } else {
      res.json({
        type: 'error',
        message: err.message || 'Internal Server Error',
        stackTrace: err.stack
      });
    }
  });
};
