'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { spawn } = require('child_process');

const { expect } = chai;

chai.use(chaiHttp);
const models = require('../../lib/models');

let child;
const host = 'http://localhost:6001';

describe('Performance tests', function a() {
  this.timeout(40000);
  before('run api server', async () => {
    await models.install({
      wikiName: 'test wiki',
      domain: 'http://localhost:6001',
      adminUsername: 'Admin',
      adminPassword: 'adminPassword',
      frontPageName: 'Front Page',
    });
    await models.initialize();
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


  describe.only('Slow parsing', () => {
    it('test 1: fetching sequentially', async () => {
      console.log('Creating articles...');
      const admin = await models.User.findByPk(1);
      await models.Article.createNew({
        ipAddress: '0.0.0.0',
        fullTitle: 'Test',
        author: admin,
        wikitext: '==heading==\n[[asdf]]\n\n'.repeat(5000),
        summary: 'asdf',
      });
      await models.Article.createNew({
        ipAddress: '0.0.0.0',
        fullTitle: 'Test2',
        author: admin,
        wikitext: '==heading==\n[[asdf]]\n\n'.repeat(2),
        summary: 'asdf',
      });
      console.log('Parsing...');
      const res = await chai.request(host).get('/v1/articles/Test?fields=html').send();
      const res2 = await chai.request(host).get('/v1/articles/Test2?fields=html').send();
      expect(res).to.have.status(200);
      expect(res2).to.have.status(200);
    });
    it('test 2: fetching simultaneously. Parsing the light one should not be blocked', async () => {
      console.log('Creating articles...');
      const admin = await models.User.findByPk(1);
      await models.Article.createNew({
        ipAddress: '0.0.0.0',
        fullTitle: 'Test',
        author: admin,
        wikitext: '==heading==\n[[asdf]]\n\n'.repeat(5000),
        summary: 'asdf',
      });
      await models.Article.createNew({
        ipAddress: '0.0.0.0',
        fullTitle: 'Test2',
        author: admin,
        wikitext: '==heading==\n[[asdf]]\n\n'.repeat(2),
        summary: 'asdf',
      });
      console.log('Parsing...');
      const [res0, res1] = await Promise.all([
        chai.request(host).get('/v1/articles/Test?fields=html').send(),
        chai.request(host).get('/v1/articles/Test2?fields=html').send(),
      ]);
      expect(res0).to.have.status(200);
      expect(res1).to.have.status(200);
    });
  });

  after('kill api server', async () => {
    child.kill();
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
});
