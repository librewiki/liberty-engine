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

models.setDefaultInstances = function() {
  return Promise.resolve()
  .then(() => {
    return models.User.initialize();
  })
  .then(() => {
    return models.User.create({ username: 'Admin001', password: 'password', email: 'asdf@gmail.com' });
  })
  .then(() => {
    return models.Namespace.create({
      id: 0,
      name: '(default)'
    });
  })
  .then(() => {
    return models.Namespace.initialize();
  })
  .then(() => {
    let user;
    return models.User.findById(1)
    .then((user1) => {
      user = user1;
      return models.Article.createNew({ ipAddress: '192.111.23.4', fullTitle: 'asfd', author: user, text: '--~~~~' });
    })
    .then((article) => {
      return article.rename({ ipAddress: '192.111.23.4', fullTitle: 'aaaAA', author: user });
    })
    .then(() => {
      return models.Article.createNew({ ipAddress: '192.111.23.4', fullTitle: 'qqQq', author: user, text: '--~~~~' });
    })
    .then((article) => {
      return article.delete({ ipAddress: '192.111.23.4', author: user });
    })
    .then(() => {
      return models.Article.createNew({ ipAddress: '192.111.23.4', fullTitle: '뷁뷀⏰', author: user, text: '--~~~~' });
    })
    .then((article) => {
      return article.edit({ ipAddress: 'ffff:adda:0011:1111:0000:1111:2200:1131', author: user, text: 'asdfsdfdf!!!! --~~~~' });
    })
    .then(() => {
      return models.Revision.findById(3);
    })
    .then((rev) => {
      console.log(rev);
      console.log(rev.ipAddress);
    });
  });
};
