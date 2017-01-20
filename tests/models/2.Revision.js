// 'use strict';
//
// process.env.NODE_ENV = 'test';
//
// const chai = require('chai');
// const should = chai.should();
// const models = require('../../models');
//
// describe('Revision', () => {
//   before((done) => {
//     models.sequelize.sync({ force: true })
//     .then(() => {
//       done();
//     });
//   });
//   describe('Create', () => {
//     it('should create a revision', () => {
//       return Promise.resolve()
//       .then(() => {
//         return models.User.create({
//           username: 'test1',
//           password: 'testpAsSword!',
//           email: 'tester@testmail.com'
//         });
//       })
//       .then((user) => {
//         return models.Revision.create({
//           author_id: user.id
//         });
//       })
//       .then((revision) => {
//         console.log(revision);
//       });
//     });
//   });
// });
