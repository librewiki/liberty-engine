/**
 * List of node clases used for prerendering.
 * @module modules/WikiRenderer/Preprocessor/Nodes/NodeList.js
 */

'use strict';

module.exports.default = {
  RootNode: require('./RootNode.js'),
  TemplateNode: require('./TemplateNode'),
  ArgumentNode: require('./ArgumentNode'),
  TextNode: require('./TextNode.js'),
};
