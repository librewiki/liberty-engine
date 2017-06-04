'use strict';
const path = require('path');

module.exports = function(express, app) {
  const index = require(global.rootdir + '/routes/index');
  const users = require(global.rootdir + '/routes/users');
  const authentication = require(global.rootdir + '/routes/authentication');
  const recentChanges = require(global.rootdir + '/routes/recent-changes');
  const siteNotice = require(global.rootdir + '/routes/site-notice');
  const frontPage = require(global.rootdir + '/routes/front-page');
  const articles = require(global.rootdir + '/routes/articles');
  const namespaces = require(global.rootdir + '/routes/namespaces');
  const roles = require(global.rootdir + '/routes/roles');
  const revisions = require(global.rootdir + '/routes/revisions');
  const mailConfirm = require(global.rootdir + '/routes/mail-confirm');
  const preview = require(global.rootdir + '/routes/preview');

  app.use('/swagger\.json', express.static(path.join(global.rootdir, './docs/swagger.json')));
  app.use('/swagger-ui', express.static(path.join(global.rootdir, './node_modules/swagger-ui/dist')));
  app.use('/swagger', (req, res) => {
    res.redirect('/swagger-ui?url=/swagger.json');
  });
  app.use('/', index);
  app.use('/users', users);
  app.use('/authentication', authentication);
  app.use('/recent-changes', recentChanges);
  app.use('/site-notice', siteNotice);
  app.use('/front-page', frontPage);
  app.use('/articles', articles);
  app.use('/namespaces', namespaces);
  app.use('/roles', roles);
  app.use('/revisions', revisions);
  app.use('/mail-confirm', mailConfirm);
  app.use('/preview', preview);
};
