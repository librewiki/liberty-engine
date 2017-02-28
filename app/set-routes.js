'use strict';
module.exports = function(app) {
  const index = require(global.rootdir + '/routes/index');
  const users = require(global.rootdir + '/routes/users');
  const authentication = require(global.rootdir + '/routes/authentication');
  const recentChanges = require(global.rootdir + '/routes/recent-changes');
  const siteNotice = require(global.rootdir + '/routes/site-notice');
  const frontPage = require(global.rootdir + '/routes/front-page');
  const articles = require(global.rootdir + '/routes/articles');
  const namespaces = require(global.rootdir + '/routes/namespaces');
  const roles = require(global.rootdir + '/routes/roles');

  app.use('/', index);
  app.use('/users', users);
  app.use('/authentication', authentication);
  app.use('/recent-changes', recentChanges);
  app.use('/site-notice', siteNotice);
  app.use('/front-page', frontPage);
  app.use('/articles', articles);
  app.use('/namespaces', namespaces);
  app.use('/roles', roles);
};
