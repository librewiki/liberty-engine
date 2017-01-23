'use strict';
process.env.NODE_ENV = 'test';
global.LIBERTY_VERSION = '0.0.1';
const path = require('path');
global.rootdir = path.join(__dirname, '/../..');
const models = require(global.rootdir + '/models');
const chai = require('chai');
const should = chai.should();
const settings = require(global.rootdir + '/config/settings.json');
const wikitextParser = require(global.rootdir + '/src/LibertyParser').wikitextParser;

describe('Users', () => {
  before(() => {
    return models.initialize({ force: true });
  });

  describe('Text', () => {
    it('should be rendered correctly', () => {
      return wikitextParser.parseRender({ wikitext: 'asdf' })
      .then((result) => {
        result.html.should.be.eql(
`<p>
asdf
</p>`);
      });
    });
  });

  describe('Link', () => {
    it('should be rendered correctly', () => {
      return wikitextParser.parseRender({ wikitext: '[[asdf]]' })
      .then((result) => {
        result.html.should.be.eql(
`<p>
<a class="new" href="asdf">asdf</a>
</p>`);
      });
    });
  });

  describe('Magic Word', () => {
    it('should be rendered correctly', () => {
      return wikitextParser.parseRender({ wikitext: '{{SITENAME}}' })
      .then((result) => {
        result.html.should.be.eql(
`<p>
${settings.WIKI_NAME}
</p>`);
      });
    });

    it('should be rendered correctly', () => {
      return wikitextParser.parseRender({ wikitext: '{{SERVER}}' })
      .then((result) => {
        result.html.should.be.eql(
`<p>
${settings.DOMAIN}
</p>`);
      });
    });

  });

});
