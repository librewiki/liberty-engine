'use strict';

process.env.NODE_ENV = 'test';
global.LIBERTY_VERSION = '0.0.1';
const path = require('path');

const models = require('../../lib/models');
const chai = require('chai');

const should = chai.should();

describe('Article', () => {
  before(async () => {
    await models.install();
    await models.initialize();
  });
  describe('Create new', () => {
    it('should create an article and a revision', () => {
    });
  });
});
