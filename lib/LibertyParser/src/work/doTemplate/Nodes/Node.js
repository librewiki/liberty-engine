/**
 * Bass class representing a markup node
 * @module modules/WikiRenderer/Nodes/Node.js
 */

'use strict';

/**
 * Bass class representing a wiki node
 * @abstract
 */
class Node {
  /**
   * Create a node.
   */
  constructor() {
    this.type = 'abstract';
    this.children = [];
  }

  /**
   * Render this node into HTML.
   * @abstract
   * @return {string} the result HTML.
   */
  // eslint-disable-next-line
  render(parsingData, option) {
    throw new Error('Should be overridden.');
  }

  /**
   * Set children.
   * @param {Node[]|Node} an array of nodes or a node.
   */
  setChildren(children) {
    if (Array.isArray(children)) {
      children.map(child => this.children.push(child));
    } else if (children instanceof Node) {
      this.children.push(children);
    }
  }

  async renderChildren(parsingData, option) {
    const results = await Promise.all(
      this.children.map(child => child.render(parsingData, option)),
    );
    return results.join('');
  }

  static indent(str) {
    return str.split('\n').map(line => `  ${line}`).join('\n');
  }
}

module.exports = Node;
