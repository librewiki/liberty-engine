'use strict';

process.env.NODE_ENV = 'test';

const models = require('../../lib/models');
const chai = require('chai');

const should = chai.should();
const Setting = require('../../lib/models/Setting');
const wikitextParser = require('../../lib/LibertyParser').wikitextParser;
const i18n = require('../../i18n');

const settings = {
  wikiName: 'Liberty Wiki',
  domain: 'localhost',
};

describe('Parser', () => {
  before(async () => {
    await models.install(settings);
    await models.initialize();
  });

  describe('Text', () => {
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: 'asdf' });
      result.html.should.be.eql(`<p>
    asdf
</p>`);
    });
    it('should be rendered correctly (unicode)', async () => {
      const result = await wikitextParser.parseRender({ wikitext: 'Iñtërnâtiônàlizætiøn☃💩' });
      result.html.should.be.eql(`<p>
    Iñtërnâtiônàlizætiøn☃💩
</p>`);
    });
  });

  describe('Link', () => {
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '[[asdf]]' });
      result.html.should.be.eql(`<p>
    <a class="new" href="asdf">asdf</a>
</p>`);
    });
    it('should be rendered correctly (unicode)', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '[[Iñtërnâtiônàlizætiøn☃💩]]' });
      result.html.should.be.eql(`<p>
    <a class="new" href="Iñtërnâtiônàlizætiøn☃💩">Iñtërnâtiônàlizætiøn☃💩</a>
</p>`);
    });
  });

  describe('Heading', () => {
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '==aaa==' });
      result.html.should.be.eql('<h2><span id="s-1" class="liberty-wiki-heading"><a href="#toc-title">1</a> aaa</span></h2>');
    });
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '===aaa===' });
      result.html.should.be.eql('<h3><span id="s-1" class="liberty-wiki-heading"><a href="#toc-title">1</a> aaa</span></h3>');
    });
    it('should be rendered correctly (unicode)', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '===Iñtërnâtiônàlizætiøn☃💩===' });
      result.html.should.be.eql('<h3><span id="s-1" class="liberty-wiki-heading"><a href="#toc-title">1</a> Iñtërnâtiônàlizætiøn☃💩</span></h3>');
    });
  });

  describe('Table of Contents', () => {
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '__TOC__\n==aaa==' });
      result.html.should.be.eql(`<div id="toc" class="toc">
    <div id="toc-title">
        <h2>${i18n.t('LibertyParser:TableOfContents')}</h2>
    </div>
    <ul>
        <li class="toc-level-1 toc-section-1">
            <a href="#s-1"><span class="toc-number">1</span> <span class="toc-text">aaa</span></a>
        </li>
    </ul>
</div>


<h2><span id="s-1" class="liberty-wiki-heading"><a href="#toc-title">1</a> aaa</span></h2>`);
    });
    it('should be rendered correctly (unicode)', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '__TOC__\n==Iñtërnâtiônàlizætiøn☃💩==' });
      result.html.should.be.eql(`<div id="toc" class="toc">
    <div id="toc-title" class="toc-title">
        <h2>${i18n.t('LibertyParser:TableOfContents')}</h2>
    </div>
    <ul>
        <li class="toc-level-1 toc-section-1">
            <a href="#s-1"><span class="toc-number">1</span> <span class="toc-text">Iñtërnâtiônàlizætiøn☃💩</span></a>
        </li>
    </ul>
</div>


<h2><span id="s-1" class="liberty-wiki-heading"><a href="#toc-title">1</a> Iñtërnâtiônàlizætiøn☃💩</span></h2>`);
    });
  });

  describe('Magic Word', () => {
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '{{SITENAME}}' });
      result.html.should.be.eql(`<p>
    ${Setting.get('wikiName')}
</p>`);
    });

    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '{{SERVER}}' });
      result.html.should.be.eql(`<p>
    ${Setting.get('domain')}
</p>`);
    });
  });
});
