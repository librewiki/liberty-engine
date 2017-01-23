'use strict';
const Node = require('./Node.js');
const MagicWord = require('../MagicWord');
const { Namespace } = require('../../.././../../../models');
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
  setTitleAndMagicWord(parsingData, option) {
    return Promise.all(this.titleChildren.map((child) => child.render(parsingData, option)))
    .then((results) => {
      let title = results.join('').trim();
      let magicWord = MagicWord.getMagicWord(title);
      if (magicWord) {
        if (magicWord.needColon) {
          let rest;
          [title, ...rest] = title.split(':');
          this.magicWordParams.push(rest.join(':'));
        }
      } else {
        if (title.charAt(0) === ':') {
          title = title.slice(1);
        } else if (title.indexOf(':') === -1) {
          title = Namespace.joinIdTitle(Namespace.StandardNamespaceEnum.TEMPLATE, title);
        }
      }
      this.templateFullTitle = title;
      this.magicWord = magicWord;
    });
  }
  setParams(parsingData, option) {
    this.params.push(undefined);
    return Promise.all(this.paramChildren.map((child) => child.render(parsingData, option)))
    .then((params) => {
      for (let param of params) {
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
    });
  }
  render(parsingData, option) {
    if (option.templateRecursionNumber > 4) {
      return `<span class="error"> template too deep </span>`;
    }
    return this.setTitleAndMagicWord(parsingData, option)
    .then(() => this.setParams(parsingData, option))
    .then(() => {
      if (this.magicWord) {
        return this.magicWord.run(parsingData, this.magicWordParams);
      } else {
        let [namespaceId, title] = Namespace.splitIntoIdTitle(this.templateFullTitle);
        parsingData.structureData.link.templates.add({ namespaceId, title });
        return parsingData.parserSupporter.templateTextGetter.get(this.templateFullTitle);
      }
    })
    .then((resultText) => {
      return doPartial.onlyinclude(resultText, parsingData);
    })
    .then((resultText) => {
      return doXml('onTemplateLoaded', resultText, parsingData);
    })
    .then((resultText) => {
      return doTemplate(resultText, parsingData, {
        recursionCount: option.templateRecursionNumber + 1,
        templateParams: this.magicWord? undefined : this.params
      });
    })
    .catch((err) => {
      switch (err.name) {
        case 'NoArticleError':
          return `<span class="error"> no such template: ${this.templateFullTitle} </span>`;
        default:
          console.log(err);
          return '<span class="error"> Error </span>';
      }
    });
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
