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
    return sequelize.query("SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO'");
  })
  .then(() => {
    return models.User.findOne({
      where: {
        id: 0,
      }
    })
    .then((user) => {
      if (!user) {
        return sequelize.query("INSERT INTO `user` (`id`,`username`,`passwordHash`) VALUES ('0','(Anonymous)','youcannotlogin')", sequelize.QueryTypes.INSERT);
      }
    });
  })
  .then(() => {
    return sequelize.query("SET SESSION sql_mode=''");
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
      return models.Article.createNew({ fullTitle: 'asfd', author: user, text: '--~~~~' });
    })
    .then((article) => {
      return article.rename({ fullTitle: 'cccc', author: user });
    })
    .then(() => {
      return models.Article.createNew({ fullTitle: 'qqqq', author: user, text: '--~~~~' });
    })
    .then((article) => {
      return article.delete({ author: user });
    })
    .then(() => {
      return models.Article.createNew({ fullTitle: '뷁뷀⏰', author: user, text: '--~~~~' });
    })
    .then((article) => {
      return article.edit({ author: user, text: 'asdfsdfdf!!!! --~~~~' });
    });
  });
};
