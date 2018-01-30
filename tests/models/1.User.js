'use strict';

process.env.NODE_ENV = 'test';

const models = require('../../lib/models');

const chai = require('chai');

const should = chai.should();

const settings = {
  wikiName: 'Liberty Wiki',
  domain: 'localhost',
};

describe('User', () => {
  before(async () => {
    await models.install(settings);
    await models.initialize();
  });
  describe('Create', () => {
    it('should create a user', async () => {
      const user = await models.User.create({
        username: 'test1',
        password: 'testpAsSword!',
        email: 'tester@testmail.com',
      });
      user.username.should.eql('test1');
      user.email.should.eql('tester@testmail.com');
      should.not.exist(user.password);
      (await user.verifyPassword('wrongPass')).should.eql(false);
      (await user.verifyPassword('testpAsSword!')).should.eql(true);
    });
    it('should create a user (unicode)', async () => {
      const user = await models.User.create({
        username: 'Iñtërnâtiônàlizætiøn☃💩',
        password: 'Iñtërnâtiônàlizætiøn☃💩!',
        email: 'tester8@testmail.com',
      });
      user.username.should.eql('Iñtërnâtiônàlizætiøn☃💩');
      user.email.should.eql('tester8@testmail.com');
      should.not.exist(user.password);
      (await user.verifyPassword('wrongPass')).should.eql(false);
      (await user.verifyPassword('Iñtërnâtiônàlizætiøn☃💩!')).should.eql(true);
    });
    it('should fail if invalid argument is passed in', async () => {
      try {
        const res = await models.User.create({
          username: 'test2',
          password: 'short',
        });
        should.not.exist(res);
      } catch (err) {
        err.name.should.eql('SequelizeValidationError');
      }
    });
    it('should fail if existing username is passed in', async () => {
      try {
        const res = await models.User.create({
          username: 'test1',
          password: 'password!!',
        });
        should.not.exist(res);
      } catch (err) {
        err.name.should.eql('SequelizeUniqueConstraintError');
      }
    });
  });
});
