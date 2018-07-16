'use strict';

const moment = require('moment');
const DataTypes = require('../DataTypes');
const LibertyModel = require('./LibertyModel');

const nowikiRegex1 = /\\nowiki\\/g;
const nowikiRegex2 = /<(pre|nowiki|math)(?:(?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(?:\/?)>((?:.|\n)*?)<\/\1>/gi;
const annotRegex = /<!--((?:.|\n)*?)-->/g;

class Wikitext extends LibertyModel {
  static getAttributes() {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      text: {
        type: DataTypes.TEXT('medium'),
        allowNull: false,
      },
    };
  }

  /**
   * Replace wikitext when it is saved.
   * @method replaceOnSave
   * @async
   * @static
   * @param {Object} option
   * @param {User} option.ipAddress ip.
   * @param {User} option.article an article to change.
   * @param {User} option.author user writing this.
   * @param {String} option.wikitext wikitext.
   * @param {String} option.status one of 'new', 'normal', 'moved', or 'deleted'.
   * @return {Promise<String>} Returns a replaced wikitext.
   */
  static async replaceOnSave({ ipAddress, author, wikitext }) {
    const date = moment().format();
    const nowikiArr = [];
    const newText = wikitext
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(nowikiRegex1, '\\Nowiki\\')
      .replace(nowikiRegex2, ($0) => {
        const x = nowikiArr.push($0);
        return `\\nowiki\\_${x - 1}_\\nowiki\\`;
      })
      .replace(annotRegex, ($0) => {
        const x = nowikiArr.push($0);
        return `\\nowiki\\_${x - 1}_\\nowiki\\`;
      });
    const signature = await author.getSignature(ipAddress);
    return newText.replace(/~~~~~/g, date)
      .replace(/~~~~/g, `${signature} ${date}`)
      .replace(/~~~/g, signature)
      .replace(/\\nowiki\\_(\d+)_\\nowiki\\/g, ($0, $1) => nowikiArr[$1]);
  }
}

module.exports = Wikitext;
