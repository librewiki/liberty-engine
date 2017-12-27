/**
 * Class representing a text node.
 * @module modules/WikiRenderer/Nodes/TextNode.js
 */

'use strict';

const Node = require('./Node.js');

class TextNode extends Node {
  constructor(text) {
    super();
    this.type = 'text';
    this.text = text;
  }

  render() {
    return this.text;
  }
}
module.exports = TextNode;
