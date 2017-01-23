'use strict';

process.env.NODE_ENV = 'test';
global.LIBERTY_VERSION = '0.0.1';
const path = require('path');
global.rootdir = path.join(__dirname, '/../..');
const models = require(global.rootdir + '/models');
const chai = require('chai');
const should = chai.should();

describe('Users', () => {
  beforeEach(() => {
    return models.sequelize.sync({ force: true });
  });
  describe('GET /users', () => {
    it('it should GET all the users', () => {
      // return chai.request(server)
      // .get('/users')
      // .then((res) => {
      //   res.should.have.status(200);
      //   res.body.should.be.a('array');
      //   res.body.length.should.be.eql(0);
      // });
    });
  });
});
