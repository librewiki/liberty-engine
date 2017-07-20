'use strict';

const path = require('path');

module.exports = (express, app) => {
  const index = require('../routes/index');
  const users = require('../routes/users');
  const authentication = require('../routes/authentication');
  const siteNotice = require('../routes/site-notice');
  const frontPage = require('../routes/front-page');
  const articles = require('../routes/articles');
  const namespaces = require('../routes/namespaces');
  const roles = require('../routes/roles');
  const revisions = require('../routes/revisions');
  const mailConfirm = require('../routes/mail-confirm');
  const preview = require('../routes/preview');
  const discussionTopics = require('../routes/discussion-topics');
  const links = require('../routes/links');


  app.use('/swagger.json', express.static('../../docs/swagger.json'));
  app.use('/swagger-ui', express.static('../../node_modules/swagger-ui/dist'));
  app.use('/swagger', (req, res) => {
    res.redirect('/swagger-ui?url=/swagger.json');
  });
  app.use('/', index);
  app.use('/users', users);
  app.use('/authentication', authentication);
  app.use('/site-notice', siteNotice);
  app.use('/front-page', frontPage);
  app.use('/articles', articles);
  app.use('/namespaces', namespaces);
  app.use('/roles', roles);
  app.use('/revisions', revisions);
  app.use('/mail-confirm', mailConfirm);
  app.use('/preview', preview);
  app.use('/discussion-topics', discussionTopics);
  app.use('/links', links);
};
