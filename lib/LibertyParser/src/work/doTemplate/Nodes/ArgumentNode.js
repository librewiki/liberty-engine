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

  async setArg(parsingData, option) {
    const results = await Promise.all(
      this.argChildren.map(child => child.render(parsingData, option)),
    );
    this.argNameNoTrim = results.join('');
    this.argName = this.argNameNoTrim.trim();
  }

  async setDefault(parsingData, option) {
    if (this.defaultChildren !== null) {
      const results = await Promise.all(
        this.defaultChildren.map(child => child.render(parsingData, option)),
      );
      this.defaultText = results.join('');
    }
    this.defaultText = `{{{${this.argNameNoTrim}}}}`;
  }

  async render(parsingData, option) {
    await this.setArg(parsingData, option);
    await this.setDefault(parsingData, option);
    if (option.templateParams.get(this.argName)) {
      return option.templateParams.get(this.argName);
    }
    return this.defaultText;
  }
}
module.exports = ArgumentNode;
