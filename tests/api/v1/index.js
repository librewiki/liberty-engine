'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { spawn } = require('child_process');

const { expect } = chai;

chai.use(chaiHttp);
const models = require('../../../lib/models');

let child;
const host = 'http://localhost:6001';

describe('API index', () => {
  before('run api server', async () => {
    const env = Object.create(process.env);
    env.NODE_ENV = 'test';
    env.PORT = '6001';
    child = spawn('node', ['./bin/www'], {
      env,
      stdio: [0, 1, 2, 'ipc'],
    });
    return new Promise((resolve) => {
      child.on('message', (message) => {
        if (message === 'server on') {
          resolve();
        }
      });
    });
  });


  beforeEach('clear models', async () => {
    await models.install({
      wikiName: 'test wiki',
      domain: 'http://localhost:6001',
      adminUsername: 'Admin',
      adminPassword: 'adminPassword',
      frontPageName: 'Front Page',
    });
    await models.initialize();
  });


  describe('GET /', () => {
    it('should success (200) with text "Hello, Anonymous!"', async () => {
      const res = await chai.request(host).get('/v1').send();
      expect(res).to.have.status(200);
      expect(res.body).to.equal('Hello, (anonymous)!');
    });
  });

  after('kill api server', async () => {
    child.kill();
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
});
