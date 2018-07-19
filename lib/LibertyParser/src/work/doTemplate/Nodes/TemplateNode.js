'use strict';

const Node = require('./Node.js');
const MagicWord = require('../MagicWord');
const doXml = require('../../doXml');
const doPartial = require('../../doPartial');
const ArrayMap = require('../../../../../utils/ArrayMap');


class TemplateNode extends Node {
  constructor() {
    super();
    this.type = 'template';
    this.params = new ArrayMap();
    this.magicWordParams = [];
    this.titleChildren = [];
    this.paramChildren = [];
  }

  setTitleChildren(nodes) {
    if (Array.isArray(nodes)) {
      nodes.map(node => this.titleChildren.push(node));
    } else if (nodes instanceof Node) {
      this.titleChildren.push(nodes);
    }
  }

  setParamChildren(nodes) {
    if (Array.isArray(nodes)) {
      nodes.map(node => this.paramChildren.push(node));
    } else if (nodes instanceof Node) {
      this.paramChildren.push(nodes);
    }
  }

  async setTitleAndMagicWord(parsingData, option) {
    const results = await Promise.all(
      this.titleChildren.map(child => child.render(parsingData, option)),
    );
    let title = results.join('').trim();
    const magicWord = MagicWord.getMagicWord(title);
    if (magicWord) {
      if (magicWord.colonIsNeeded) {
        let rest;
        [title, ...rest] = title.split(':');
        this.magicWordParams.push(rest.join(':'));
      }
    } else if (title.charAt(0) === ':') {
      title = title.slice(1);
    } else if (title.charAt(0) === '/') {
      title = parsingData.articleMetadata.fullTitle + title;
    } else if (title.indexOf(':') === -1) {
      title = parsingData.parserHelper.joinNamespaceIdTitle(
        parsingData.wikiMetadata.KnownNamespaces.TEMPLATE.id, title,
      );
    }
    this.templateFullTitle = title;
    this.magicWord = magicWord;
  }

  async setParams(parsingData, option) {
    this.params.push(undefined);
    const params = await Promise.all(
      this.paramChildren.map(child => child.render(parsingData, option)),
    );
    for (const param of params) {
      this.magicWordParams.push(param);
      let [key, ...rest] = param.length ? param.match(/(\\.|[^=])+/ug) : [''];
      const value = rest.join('=').trim();
      key = key.trim();
      if (value.length) {
        this.params.set(key, value);
      } else {
        this.params.push(param);
      }
    }
  }

  async render(parsingData, option) {
    try {
      if (option.templateRecursionNumber > 4) {
        return '<span class="error"> template too deep </span>';
      }
      await this.setTitleAndMagicWord(parsingData, option);
      await this.setParams(parsingData, option);
      if (this.magicWord) {
        return this.magicWord.run(parsingData, this.magicWordParams);
      }
      const { namespace, title } = parsingData.parserHelper.splitFullTitle(this.templateFullTitle);
      parsingData.structureData.link.templates.add({ namespaceId: namespace.id, title });
      let resultText = (
        await parsingData.parserHelper.templateTextGetter.get(this.templateFullTitle)
      );
      resultText = await doPartial.onlyinclude(resultText, parsingData);
      resultText = await doXml('onTemplateLoaded', resultText, parsingData);
      // eslint-disable-next-line no-use-before-define
      resultText = await doTemplate(resultText, parsingData, {
        recursionCount: option.templateRecursionNumber + 1,
        templateParams: this.magicWord ? undefined : this.params,
      });
      return resultText;
    } catch (err) {
      switch (err.name) {
        case 'NoArticleError':
          return `<span class="error"> no such template: ${this.templateFullTitle} </span>`;
        default:
          console.error(err);
          return '<span class="error"> Error </span>';
      }
    }
  }
}
TemplateNode.param = class extends Node {
  constructor() {
    super();
    this.type = 'templateparam';
  }

  render(parsingData, option) {
    return this.renderChildren(parsingData, option);
  }
};
module.exports = TemplateNode;
const doTemplate = require('../');
