'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const models = require('../../models');

describe('User', () => {
  before(() => {
    return models.sequelize.sync({ force: true });
  });
  describe('Create', () => {
    it('should create a user', () => {
      return Promise.resolve()
      .then(() => {
        return models.User.create({
          username: 'test1',
          password: 'testpAsSword!',
          email: 'tester@testmail.com'
        });
      })
      .then((user) => {
        user.username.should.eql('test1');
        user.email.should.eql('tester@testmail.com');
        should.not.exist(user.password);
        return user.authenticate('wrongPass')
        .then((res) => {
          res.should.eql(false);
          return user.authenticate('testpAsSword!');
        })
        .then((res) => {
          res.should.eql(true);
        });
      });
    });
    it('should fail if invalid argument is passed in', () => {
      return Promise.resolve()
      .then(() => {
        return models.User.create({
          username: 'test2',
          password: 'short'
        });
      })
      .then((res) => {
        should.not.exist(res);
      })
      .catch((err) => {
        err.name.should.eql('SequelizeValidationError');
      });
    });
    it('should fail if existing username is passed in', () => {
      return Promise.resolve()
      .then(() => {
        return models.User.create({
          username: 'test1',
          password: 'password!!'
        });
      })
      .then((res) => {
        should.not.exist(res);
      })
      .catch((err) => {
        err.name.should.eql('SequelizeUniqueConstraintError');
      });
    });
  });
});
