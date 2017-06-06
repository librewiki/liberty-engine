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
const { ACCESS_ADMIN_PANEL } = require('../src/SpecialPermissionConstants');

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

models.install = async function() {
  await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
  await models.sequelize.sync({ force: true });
  await models.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  await models.Role.create({
    name: 'root'
  });
  await models.SpecialPermission.create({
    name: ACCESS_ADMIN_PANEL
  });
  await models.Namespace.create({
    id: 0,
    name: '(default)'
  });
  await models.Namespace.create({
    id: 2,
    name: '사용자'
  });
};

models.initialize = async function() {
  await models.User.initialize();
  await models.Namespace.initialize();
  await models.Setting.initialize();
  await models.SpecialPermission.initialize();
  await models.Role.initialize();
};

models.setDefaultInstances = async function() {
  await models.Setting.set('front-page', 'aaaAA');
  const user = await models.User.create({ username: 'Admin001', password: 'password', email: 'asdf@gmail.com' });
  const root = await models.Role.findById(1);
  await user.addRole(root);
  let article = await models.Article.createNew({ ipAddress: '192.111.23.4', fullTitle: 'asfd', author: user, wikitext: '--~~~~' });
  await article.rename({ ipAddress: '192.111.23.4', newFullTitle: 'aaaAA', author: user });
  article = await models.Article.createNew({ ipAddress: '192.111.23.4', fullTitle: 'qqQq', author: user, wikitext: '--~~~~' });
  await models.Redirection.create({ sourceNamespaceId: 0, sourceTitle: 'xxx', destinationArticleId: article.id });
  await models.RedirectionLog.create({ type: 'ADD', sourceNamespaceId: 0, sourceTitle: 'xxx', destinationArticleId: article.id, user: user, ipAddress: '192.111.23.4' });
  // await article.delete({ ipAddress: '192.111.23.4', author: user });
  article = await models.Article.createNew({ ipAddress: '192.111.23.4', fullTitle: '뷁뷀⏰', author: user, wikitext: '--~~~~' });
  await article.edit({ ipAddress: 'ffff:adda:0011:1111:0000:1111:2200:1131', author: models.User.anonymous, wikitext: 'asdfsdfdf!!!! --~~~~' });
  article = await models.Article.createNew({ ipAddress: '192.111.23.4', fullTitle: 'aaAAA', author: user, wikitext: '--~~~~' });
  await models.DiscussionTopic.createNew({
    ipAddress: '192.111.23.4',
    title: 'ㅁㄴㅇㄹ를 건의합니다.',
    author: user,
    wikitext: 'ㅁㅁㅁㅁ[[ㅇㅇㅇ]]ㅁ--~~~~',
    article,
  });
  const subadmin = await models.Role.create({
    name: 'subadmin'
  });
  await subadmin.addSpecialPermission(models.SpecialPermission.getByName(ACCESS_ADMIN_PANEL));
  await models.SpecialPermission.initialize();
  await models.Role.initialize();
  const user2 = await models.User.create({ username: 'subsbu', password: 'password', email: 'aaasdf@gmail.com' });
  await models.User.create({ username: 'zzzzzz', password: 'password', email: 'ccq@gmail.com' });
  await user2.addRole(subadmin);
  console.log(subadmin.hasPermissionTo(ACCESS_ADMIN_PANEL));
};
