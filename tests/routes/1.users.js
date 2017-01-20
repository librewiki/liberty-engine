'use strict';

process.env.NODE_ENV = 'test';

const models = require('../../models');
const chai = require('chai');
const should = chai.should();
const handlers = require('../../routes/users/handlers');
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
