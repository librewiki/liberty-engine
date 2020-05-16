'use strict';


module.exports = async function fn(express, app) {
  const models = require('../models');
  await models.initialize();

  const i18n = require('../../i18n');
  i18n.changeLanguage(models.Setting.get('language') || 'en');

  const logger = require('morgan');
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const helmet = require('helmet');

  app.set('trust proxy', 'loopback');
  app.use(helmet({
    frameguard: {
      action: 'deny',
    },
    hsts: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
  }));
  app.use(logger('dev'));
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));
  if (process.env.NODE_ENV === 'development') {
    app.use(cors());
  }
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
      req.user = await models.User.findByPk(decoded.id);
      return next();
    } catch (err) {
      return next(err);
    }
  });

  const apiV1 = require('../routes/v1');
  app.use('/', apiV1);
  app.use('/v1', apiV1);

  const Response = require('../responses');

  require('./set-extensions')();

  // catch 404
  app.use((req, res, next) => {
    new Response.ApiNotFound().send(res);
  });

  // error handler
  app.use((err, req, res, next) => {
    if (err.handler) {
      err.handler(req, res, next);
      return;
    }
    res.status(err.status || 500);
    console.error(err);
    if (req.app.get('env') === 'production') {
      res.json({
        type: 'error',
        message: 'Internal Server Error',
      });
    } else {
      res.json({
        type: 'error',
        message: err.message || 'Internal Server Error',
        stackTrace: err.stack,
      });
    }
  });
};
