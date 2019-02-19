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

describe('discussion-topics API', function a() {
  this.timeout(20000);
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


  describe('GET /discussion-topics', () => {
    it('should success (200) with empty array when no discussion exists', async () => {
      const res = await chai.request(host).get('/v1/discussion-topics').send();
      expect(res).to.have.status(200);
      expect(res.body).to.eql({ discussionTopics: [] });
    });


    it('should success (200) with a new topic', async () => {
      const admin = await models.User.findByPk(1);
      const article = await models.Article.createNew({
        ipAddress: '0.0.0.0',
        fullTitle: 'Test Article',
        author: admin,
        wikitext: '==heading==\nTests',
        summary: 'asdf',
      });
      await models.DiscussionTopic.createNew({
        ipAddress: '0.0.0.0',
        title: 'Test topic',
        author: admin,
        wikitext: 'Just test\n* hi\n* hello',
        article,
      });
      const topic = await models.DiscussionTopic.findByPk(1);
      const res = await chai.request(host).get('/v1/discussion-topics').send();
      expect(res).to.have.status(200);
      expect(res.body).to.eql({
        discussionTopics: [{
          id: 1,
          title: 'Test topic',
          articleId: 1,
          article: {
            id: 1,
            fullTitle: 'Test Article',
            namespaceId: 0,
            title: 'Test Article',
          },
          createdAt: topic.createdAt.toISOString(),
          updatedAt: topic.updatedAt.toISOString(),
          deletedAt: null,
          status: 'OPEN',
        }],
      });
    });


    it('should success (200) with a topic having two comments', async () => {
      const admin = await models.User.findByPk(1);
      const article = await models.Article.createNew({
        ipAddress: '0.0.0.0',
        fullTitle: 'Test Article',
        author: admin,
        wikitext: '==heading==\nTests',
        summary: 'asdf',
      });
      await models.DiscussionTopic.createNew({
        ipAddress: '0.0.0.0',
        title: 'Test topic',
        author: admin,
        wikitext: 'Just test\n* hi\n* hello',
        article,
      });
      let topic = await models.DiscussionTopic.findByPk(1);
      await models.DiscussionComment.createNew({
        wikitext: 'Just test2\n* hi\n* hello',
        topic,
        author: admin,
        ipAddress: '0.0.0.0',
      });
      topic = await models.DiscussionTopic.findByPk(1);
      const res = await chai.request(host).get('/v1/discussion-topics').send();
      expect(res).to.have.status(200);
      expect(res.body).to.eql({
        discussionTopics: [{
          id: 1,
          title: 'Test topic',
          articleId: 1,
          article: {
            id: 1,
            fullTitle: 'Test Article',
            namespaceId: 0,
            title: 'Test Article',
          },
          createdAt: topic.createdAt.toISOString(),
          updatedAt: topic.updatedAt.toISOString(),
          deletedAt: null,
          status: 'OPEN',
        }],
      });
    });


    it('should success (200) with two topics', async () => {
      const admin = await models.User.findByPk(1);
      const article = await models.Article.createNew({
        ipAddress: '0.0.0.0',
        fullTitle: 'Test Article',
        author: admin,
        wikitext: '==heading==\nTests',
        summary: 'asdf',
      });
      await models.DiscussionTopic.createNew({
        ipAddress: '0.0.0.0',
        title: 'Test topic',
        author: admin,
        wikitext: 'Just test\n* hi\n* hello',
        article,
      });
      await models.DiscussionTopic.createNew({
        ipAddress: '0.0.0.0',
        title: 'Test topic2',
        author: admin,
        wikitext: 'Just test\n* hi\n* hello',
        article,
      });
      let topic = await models.DiscussionTopic.findByPk(1);
      await models.DiscussionComment.createNew({
        wikitext: 'Just test2\n* hi\n* hello',
        topic,
        author: admin,
        ipAddress: '0.0.0.0',
      });
      topic = await models.DiscussionTopic.findByPk(1);
      await new Promise(r => setTimeout(r, 1010));
      const topic2 = await models.DiscussionTopic.findByPk(2);
      const res = await chai.request(host).get('/v1/discussion-topics').send();
      expect(res).to.have.status(200);
      expect(res.body).to.eql({
        discussionTopics: [{
          id: 1,
          title: 'Test topic',
          articleId: 1,
          article: {
            id: 1,
            fullTitle: 'Test Article',
            namespaceId: 0,
            title: 'Test Article',
          },
          createdAt: topic.createdAt.toISOString(),
          updatedAt: topic.updatedAt.toISOString(),
          deletedAt: null,
          status: 'OPEN',
        },
        {
          id: 2,
          title: 'Test topic2',
          articleId: 1,
          article: {
            id: 1,
            fullTitle: 'Test Article',
            namespaceId: 0,
            title: 'Test Article',
          },
          createdAt: topic2.createdAt.toISOString(),
          updatedAt: topic2.updatedAt.toISOString(),
          deletedAt: null,
          status: 'OPEN',
        }],
      });
    });


    it('should success (200) with recent 10 topics', async () => {
      const admin = await models.User.findByPk(1);
      const article = await models.Article.createNew({
        ipAddress: '0.0.0.0',
        fullTitle: 'Test Article',
        author: admin,
        wikitext: '==heading==\nTests',
        summary: 'asdf',
      });

      console.log('Making topics...');
      for (let i = 0; i < 15; i += 1) {
        await models.DiscussionTopic.createNew({
          ipAddress: '0.0.0.0',
          title: `Test topic ${i}`,
          author: admin,
          wikitext: 'Just test\n* hi\n* hello',
          article,
        });
        await new Promise(r => setTimeout(r, 1010));
      }

      await models.DiscussionComment.createNew({
        wikitext: 'Just test2\n* hi\n* hello',
        topic: await models.DiscussionTopic.findByPk(12),
        author: admin,
        ipAddress: '0.0.0.0',
      });

      await models.DiscussionComment.createNew({
        wikitext: 'Just test2\n* hi\n* hello',
        topic: await models.DiscussionTopic.findByPk(3),
        author: admin,
        ipAddress: '0.0.0.0',
      });

      const res = await chai.request(host).get('/v1/discussion-topics?order=updatedAt').send();
      expect(res).to.have.status(200);
      expect(res.body.discussionTopics).to.have.length(10);
      expect(res.body.discussionTopics[0].id).to.equal(3);
      expect(res.body.discussionTopics[1].id).to.equal(12);
      expect(res.body.discussionTopics[2].id).to.equal(15);
      expect(res.body.discussionTopics[3].id).to.equal(14);
      expect(res.body.discussionTopics[4].id).to.equal(13);
      expect(res.body.discussionTopics[5].id).to.equal(11);
      expect(res.body.discussionTopics[6].id).to.equal(10);
      expect(res.body.discussionTopics[7].id).to.equal(9);
      expect(res.body.discussionTopics[8].id).to.equal(8);
      expect(res.body.discussionTopics[9].id).to.equal(7);
    });
  });

  after('kill api server', async () => {
    child.kill();
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
});
