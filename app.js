'use strict';

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const models = require('./models');

models.initialize({ force: true })
.then(() => {
  return models.setDefaultInstances();
})
.catch((err) => {
  console.log(err);
  process.exit(1);
});

const app = express();

app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: 'http://localhost:3000' }));

app.use((req, res, next) => {
  const token = req.headers['x-access-token'];
  if (token) {
    return models.User.verifyToken(token)
    .then((decoded) => {
      return models.User.findById(decoded.id);
    })
    .then((user) => {
      req.user = user;
      next();
    }, (err) => {
      next(err);
    });
  } else {
    req.user = models.User.anonymous;
    next();
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

app.use('/swagger\.json', express.static(path.join(__dirname, './docs/swagger.json')));
app.use('/swagger-ui', express.static(path.join(__dirname, './node_modules/swagger-ui/dist')));
app.use('/swagger', (req, res) => {
  res.redirect('/swagger-ui?url=/swagger.json');
});

const index = require('./routes/index');
const users = require('./routes/users');
const authentication = require('./routes/authentication');
const recentChanges = require('./routes/recent-changes');
const siteNotice = require('./routes/site-notice');
const frontPage = require('./routes/front-page');
const articles = require('./routes/articles');

app.use('/', index);
app.use('/users', users);
app.use('/authentication', authentication);
app.use('/recent-changes', recentChanges);
app.use('/site-notice', siteNotice);
app.use('/front-page', frontPage);
app.use('/articles', articles);

const Response = require('./src/responses');


// catch 404 and forward to error handler
app.use((req, res, next) => {
  new Response.ApiNotFound().send(res);
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
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
