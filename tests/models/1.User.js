'use strict';

process.env.NODE_ENV = 'test';
global.LIBERTY_VERSION = '0.0.1';
const path = require('path');
global.rootdir = path.join(__dirname, '/../..');
const models = require(global.rootdir + '/models');
const chai = require('chai');
const should = chai.should();

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
        return user.verifyPassword('wrongPass')
        .then((res) => {
          res.should.eql(false);
          return user.verifyPassword('testpAsSword!');
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
