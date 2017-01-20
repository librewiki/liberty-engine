'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const models = require('../../models');

describe('Article', () => {
  before((done) => {
    models.sequelize.sync({ force: true })
    .then(() => {
      done();
    });
  });
  describe('Create new', () => {
    it('should create an article and a revision', () => {
      return models.User.create({ username:'Admin001', password:'password', email:'ads@ddd.com' })
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
        return models.User.findById(1);
      })
      .then((user) => {
        return models.Article.createNew({ fullTitle: 'asfd', author: user, wikitext: 'aaa--~~~~' });
      })
      .then((article) => {
        article.title.should.eql('asfd');
      });
    });
  });
});
