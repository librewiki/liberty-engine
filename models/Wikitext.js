/**
 * Provides Wikitext model.
 *
 * @module models
 * @submodule Wikitext
 */


'use strict';

const nowikiRegex1 = /\\nowiki\\/g;
const nowikiRegex2 = /<(pre|nowiki|math)(?:(?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(?:\/?)>((?:.|\n)*?)<\/\1>/gi;
const annotRegex = /<!--((?:.|\n)*?)-->/g;
const moment = require('moment');

/**
 * Model representing wikitexts.
 *
 * @class Wikitext
 */
module.exports = function(sequelize, DataTypes) {
  const Wikitext = sequelize.define('wikitext', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    text: {
      type: DataTypes.STRING(128),
      allowNull: false
    }
  }, {
    classMethods: {
      /**
       * Replace wikitext when it is saved.
       * @method replaceOnSave
       * @static
       * @param {Object} option
       * @param {User} option.ipAddress ip.
       * @param {User} option.article an article to change.
       * @param {User} option.author user writing this.
       * @param {String} option.wikitext wikitext.
       * @param {String} option.status one of 'new', 'normal', 'moved', or 'deleted'.
       * @return {Promise<String>} Returns a replaced wikitext.
       */
      replaceOnSave({ ipAddress, article, author, text, status }) {
        let date = moment().format();
        let nowikiArr = [];
        let newText = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(nowikiRegex1,'\\Nowiki\\')
        .replace(nowikiRegex2, ($0) => {
          let x = nowikiArr.push($0);
          return '\\nowiki\\_' + (x - 1) + '_\\nowiki\\';
        })
        .replace(annotRegex, ($0) => {
          let x = nowikiArr.push($0);
          return '\\nowiki\\_' + (x - 1) + '_\\nowiki\\';
        });
        return author.getSignature(ipAddress)
        .then((signature) => {
          return newText.replace(/~~~~~/g, date)
          .replace(/~~~~/g, signature + ' ' + date)
          .replace(/~~~/g, signature)
          .replace(/\\nowiki\\_(\d+)_\\nowiki\\/g, ($0, $1) => nowikiArr[$1]);
        });
      }
    }
  });
  return Wikitext;
};
