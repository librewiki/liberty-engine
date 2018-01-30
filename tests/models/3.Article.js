'use strict';

process.env.NODE_ENV = 'test';

const path = require('path');

const models = require('../../lib/models');
const chai = require('chai');

const should = chai.should();

const settings = {
  wikiName: 'Liberty Wiki',
  domain: 'localhost',
};

describe('Article', () => {
  before(async () => {
    await models.install(settings);
    await models.initialize();
  });
  describe('Create new', () => {
    it('should create an article and a revision', () => {
    });
  });
});
