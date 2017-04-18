/**
 * Provides models of Sequelize ORM.
 *
 * @module models
 */

'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/config.json')[env].db;
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
const models = module.exports = {};

fs.readdirSync(__dirname)
.filter((file) => {
  return (file.indexOf('.') !== 0) && (file !== 'index.js');
})
.forEach((file) => {
  let model = sequelize.import(path.join(__dirname, file));
  models[model.name.charAt(0).toUpperCase() + model.name.slice(1)] = model;
});

Object.keys(models).forEach((modelName) => {
  if ('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

models.initialize = async function({ force = false } = {}) {
  if (force) {
    await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
  }
  await models.sequelize.sync({ force });
  if (force) {
    await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
  await models.Role.create({
    name: 'sysop',
    isAdmin: true
  });
  await models.User.initialize();
  await models.Namespace.create({
    id: 0,
    name: '(default)'
  });
  await models.Namespace.initialize();
  await models.Setting.initialize();
};


models.setDefaultInstances = async function() {
  await models.Setting.set('front-page', 'aaaAA');
  const user = await models.User.create({ username: 'Admin001', password: 'password', email: 'asdf@gmail.com' });
  const sysop = await models.Role.findById(1);
  await user.addRole(sysop);
  let article = await models.Article.createNew({ ipAddress: '192.111.23.4', fullTitle: 'asfd', author: user, wikitext: '--~~~~' });
  await article.rename({ ipAddress: '192.111.23.4', newFullTitle: 'aaaAA', author: user });
  article = await models.Article.createNew({ ipAddress: '192.111.23.4', fullTitle: 'qqQq', author: user, wikitext: '--~~~~' });
  await models.Redirection.create({ sourceNamespaceId: 0, sourceTitle: 'xxx', destinationArticleId: article.id, user: user });
  await article.delete({ ipAddress: '192.111.23.4', author: user });
  article = await models.Article.createNew({ ipAddress: '192.111.23.4', fullTitle: '뷁뷀⏰', author: user, wikitext: '--~~~~' });
  await article.edit({ ipAddress: 'ffff:adda:0011:1111:0000:1111:2200:1131', author: models.User.anonymous, wikitext: 'asdfsdfdf!!!! --~~~~' });
  await models.Article.createNew({ ipAddress: '192.111.23.4', fullTitle: 'aaAAA', author: user, wikitext: '--~~~~' });
  await models.Revision.findById(3);
};
