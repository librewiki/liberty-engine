'use strict';
const Node = require('./Node.js');

class ArgumentNode extends Node {
  constructor() {
    super();
    this.type = 'argument';
    this.argName = '';
    this.defaultText = '';
    this.argChildren = [];
    this.defaultChildren = null;
  }

  setArgChildren(nodes) {
    if (Array.isArray(nodes)) {
      nodes.map(node => this.argChildren.push(node));
    } else if (nodes instanceof Node) {
      this.argChildren.push(nodes);
    }
  }

  setDefaultChildren(nodes) {
    if (this.defaultChildren === null) {
      this.defaultChildren = [];
    }

    if (Array.isArray(nodes)) {
      nodes.map(node => this.defaultChildren.push(node));
    } else if (nodes instanceof Node) {
      this.defaultChildren.push(nodes);
    }
  }

  setArg(parsingData, option) {
    return Promise.all(this.argChildren.map((child) => child.render(parsingData, option)))
    .then((results) => {
      this.argNameNoTrim = results.join('');
      this.argName = this.argNameNoTrim.trim();
    });
  }

  setDefault(parsingData, option) {
    if (this.defaultChildren !== null) {
      return Promise.all(this.defaultChildren.map((child) => child.render(parsingData, option)))
      .then((results) => {
        this.defaultText = results.join('');
      });
    } else {
      this.defaultText = `{{{${this.argNameNoTrim}}}}`;
    }
  }

  render(parsingData, option) {
    return this.setArg(parsingData, option)
    .then(() => this.setDefault(parsingData, option))
    .then(() => {
      if (option.templateParams.get(this.argName)) {
        return option.templateParams.get(this.argName);
      } else {
        return this.defaultText;
      }
    });
  }
}
module.exports = ArgumentNode;
