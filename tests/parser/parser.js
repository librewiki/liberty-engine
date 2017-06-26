'use strict';

process.env.NODE_ENV = 'test';
global.LIBERTY_VERSION = '0.0.1';
const path = require('path');

global.rootdir = path.join(__dirname, '/../..');
const models = require(`${global.rootdir}/models`);
const chai = require('chai');

const should = chai.should();
const settings = require(`${global.rootdir}/config/settings.json`);
const wikitextParser = require(`${global.rootdir}/src/LibertyParser`).wikitextParser;
const i18next = require('i18next');

describe('Parser', () => {
  before(async () => {
    i18next.init({
      debug: true,
      lng: 'en',
      fallbackLng: 'en',
      ns: [
        'LibertyParser',
      ],
      resources: {
        en: require(`${global.rootdir}/i18n/en.json`),
        ko: require(`${global.rootdir}/i18n/ko.json`),
      },
    });
    await models.install();
    await models.initialize();
  });

  describe('Text', () => {
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: 'asdf' });
      result.html.should.be.eql(
        `<p>
    asdf
</p>`
      );
    });
    it('should be rendered correctly (unicode)', async () => {
      const result = await wikitextParser.parseRender({ wikitext: 'Iñtërnâtiônàlizætiøn☃💩' });
      result.html.should.be.eql(
        `<p>
    Iñtërnâtiônàlizætiøn☃💩
</p>`
      );
    });
  });

  describe('Link', () => {
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '[[asdf]]' });
      result.html.should.be.eql(
        `<p>
    <a class="new" href="asdf">asdf</a>
</p>`
      );
    });
    it('should be rendered correctly (unicode)', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '[[Iñtërnâtiônàlizætiøn☃💩]]' });
      result.html.should.be.eql(
        `<p>
    <a class="new" href="Iñtërnâtiônàlizætiøn☃💩">Iñtërnâtiônàlizætiøn☃💩</a>
</p>`
      );
    });
  });

  describe('Heading', () => {
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '==aaa==' });
      result.html.should.be.eql(
        '<h2><span id="s-1" class="liberty-wiki-heading"><a href="#toc-title">1</a> aaa</span></h2>'
      );
    });
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '===aaa===' });
      result.html.should.be.eql(
        '<h3><span id="s-1" class="liberty-wiki-heading"><a href="#toc-title">1</a> aaa</span></h3>'
      );
    });
    it('should be rendered correctly (unicode)', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '===Iñtërnâtiônàlizætiøn☃💩===' });
      result.html.should.be.eql(
        '<h3><span id="s-1" class="liberty-wiki-heading"><a href="#toc-title">1</a> Iñtërnâtiônàlizætiøn☃💩</span></h3>'
      );
    });
  });

  describe('Table of Contents', () => {
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '__TOC__\n==aaa==' });
      result.html.should.be.eql(
        `<div id="toc" class="liberty-toc">
    <div id="toc-title">
        <h2>${i18next.t('LibertyParser:TableOfContents')}</h2>
    </div>
    <ul>
        <li class="liberty-toc-level-1 liberty-toc-section-1">
            <a href="#s-1"><span class="liberty-toc-number">1</span> <span class="liberty-toc-text">aaa</span></a>
        </li>
    </ul>
</div>


<h2><span id="s-1" class="liberty-wiki-heading"><a href="#toc-title">1</a> aaa</span></h2>`
      );
    });
    it('should be rendered correctly (unicode)', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '__TOC__\n==Iñtërnâtiônàlizætiøn☃💩==' });
      result.html.should.be.eql(
        `<div id="toc" class="liberty-toc">
    <div id="toc-title">
        <h2>${i18next.t('LibertyParser:TableOfContents')}</h2>
    </div>
    <ul>
        <li class="liberty-toc-level-1 liberty-toc-section-1">
            <a href="#s-1"><span class="liberty-toc-number">1</span> <span class="liberty-toc-text">Iñtërnâtiônàlizætiøn☃💩</span></a>
        </li>
    </ul>
</div>


<h2><span id="s-1" class="liberty-wiki-heading"><a href="#toc-title">1</a> Iñtërnâtiônàlizætiøn☃💩</span></h2>`
      );
    });
  });

  describe('Magic Word', () => {
    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '{{SITENAME}}' });
      result.html.should.be.eql(
        `<p>
    ${settings.WIKI_NAME}
</p>`
      );
    });

    it('should be rendered correctly', async () => {
      const result = await wikitextParser.parseRender({ wikitext: '{{SERVER}}' });
      result.html.should.be.eql(
        `<p>
    ${settings.DOMAIN}
</p>`
      );
    });
  });
});
