/**
 * Class representing a root node of tree.
 */

'use strict';

const Node = require('./Node.js');

class RootNode extends Node {
  constructor() {
    super();
    this.type = 'root';
  }

  render(parsingData, option) {
    return this.renderChildren(parsingData, option);
  }
}
module.exports = RootNode;
