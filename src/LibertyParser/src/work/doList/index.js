'use strict';

const listStartRegex = /^[*#:;]/um;
const listEndRegex = /^[^*#:;]/um;


const prefixTagMatchTable = {
  '*': ['ul', 'li'],
  '#': ['ol', 'li'],
  ';': ['dl', 'dt'],
  ':': ['dl', 'dd'],
};

function getCommonLength(pref1, pref2) {
  const shortLen = Math.min(pref1.length, pref2.length);
  for (let i = 0; i < shortLen; i += 1) {
    const t1 = prefixTagMatchTable[pref1[i]][0];
    const t2 = prefixTagMatchTable[pref2[i]][0];
    if (t1 !== t2) {
      return i;
    }
  }
  return shortLen;
}


class ListHierarchy {
  constructor() {
    this.children = [];
  }
  addChild(child) {
    this.children.push(child);
  }
  renderChildren() {
    return this.children.map(child => child.render()).join('');
  }
  getLastChild() {
    return this.children[this.children.length - 1];
  }
}


class ListGroup extends ListHierarchy {
  constructor(prefix) {
    super();
    this.prefix = prefix;
    this.prefixLastChar = this.prefix[this.prefix.length - 1];
    this.tag = prefixTagMatchTable[this.prefixLastChar][0];
  }

  render() {
    return `<${this.tag}>${this.renderChildren()}</${this.tag}>`;
  }
}

class ListRow extends ListHierarchy {
  constructor(line) {
    super();
    line = line.trim();
    const prefixIdx = line.search(/[^*#:;]/u);
    this.prefix = line.slice(0, prefixIdx);
    this.text = line.slice(prefixIdx);
    this.prefixLastChar = this.prefix[this.prefix.length - 1];
    this.tag = prefixTagMatchTable[this.prefixLastChar][1];
  }

  render() {
    return `<${this.tag}>${this.text}${this.renderChildren()}</${this.tag}>`;
  }
}

class List extends ListHierarchy {
  constructor(text) {
    super();
    text = text.trim();
    const parseStack = [];
    const rows = text.split('\n').map(line => new ListRow(line));
    for (const row of rows) {
      if (parseStack.length !== 0) {
        while (parseStack.length > 0) {
          const top = parseStack[parseStack.length - 1];
          const commonLength = getCommonLength(top.prefix, row.prefix);
          if (commonLength === top.prefix.length) {
            if (commonLength === row.prefix.length) { // same level
              top.addChild(row);
            } else { // sub level
              const group = new ListGroup(row.prefix);
              group.addChild(row);
              top.getLastChild().addChild(group);
              parseStack.push(group);
            }
            break;
          } else {
            parseStack.pop();
            if (parseStack.length === 0) {
              this.addChild(row);
              break;
            }
          }
        }
      } else {
        const group = new ListGroup(row.prefix);
        group.addChild(row);
        this.addChild(group);
        parseStack.push(group);
      }
    }
  }

  render() {
    return `</p>\n${this.renderChildren()}\n<p>`;
  }
}

module.exports = async (wikitext) => {
  let result = '';
  let text = wikitext;
  let startIdx;
  let endIdx;
  let listText;
  while ((startIdx = text.search(listStartRegex)) !== -1) {
    result += text.slice(0, startIdx);
    text = text.slice(startIdx);
    endIdx = text.search(listEndRegex);
    if (endIdx === -1) {
      listText = text.trim('');
      text = '';
    } else {
      listText = text.slice(0, endIdx - 1);
      text = text.slice(endIdx - 1);
    }
    result += new List(listText).render();
  }
  result += text;
  return result;
};
