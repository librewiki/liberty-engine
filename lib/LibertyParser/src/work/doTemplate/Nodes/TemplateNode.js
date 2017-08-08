'use strict';

const Node = require('./Node.js');
const MagicWord = require('../MagicWord');
const models = require('../.././../../../models');
const doXml = require('../../doXml');
const doPartial = require('../../doPartial');
const ArrayMap = require('../../../ArrayMap');


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
      this.titleChildren.map(child => child.render(parsingData, option))
    );
    let title = results.join('').trim();
    const magicWord = MagicWord.getMagicWord(title);
    if (magicWord) {
      if (magicWord.needColon) {
        let rest;
        [title, ...rest] = title.split(':');
        this.magicWordParams.push(rest.join(':'));
      }
    } else if (title.charAt(0) === ':') {
      title = title.slice(1);
    } else if (title.indexOf(':') === -1) {
      title = models.Namespace.joinNamespaceIdTitle(models.Namespace.Known.TEMPLATE.id, title);
    }
    this.templateFullTitle = title;
    this.magicWord = magicWord;
  }
  async setParams(parsingData, option) {
    this.params.push(undefined);
    const params = await Promise.all(
      this.paramChildren.map(child => child.render(parsingData, option))
    );
    for (const param of params) {
      this.magicWordParams.push(param);
      const [key, ...rest] =
    param.split('').reverse().join('').split(/=(?!\\)/)
      .map(s => s.trim().split('').reverse().join('').replace('\\=', '='))
      .reverse();
      if (rest.length) {
        this.params.set(key, rest.join('='));
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
      const { namespace, title } = models.Namespace.splitFullTitle(this.templateFullTitle);
      parsingData.structureData.link.templates.add({ namespaceId: namespace.id, title });
      let resultText =
        await parsingData.parserSupporter.templateTextGetter.get(this.templateFullTitle);
      resultText = await doPartial.onlyinclude(resultText, parsingData);
      resultText = await doXml('onTemplateLoaded', resultText, parsingData);
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
          console.log(err);
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
