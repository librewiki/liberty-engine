'use strict';

module.exports = async function(express, app) {
  const models = require(global.rootdir + '/models');
  await models.initialize();

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
  app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:8080'] }));
  app.use(async (req, res, next) => {
    try {
      req.ipAddress = req.ip.replace(/^::ffff:/, '');
      if (req.path === '/authentication/refresh') {
        return next();
      }
      const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
      if (!token) {
        req.user = models.User.anonymous;
        return next();
      }
      const decoded = await models.User.verifyToken(token);
      if (decoded.type !== 'ACCESS') {
        const err = new Error('An access token is needed.');
        err.name = 'BadTokenTypeError';
        throw err;
      }
      req.user = await models.User.findById(decoded.id);
      return next();
    } catch (err) {
      return next(err);
    }
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
