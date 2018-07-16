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
    // eslint-disable-next-line prefer-destructuring
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
    let prefixIdx = line.search(/[^*#:;]/u);
    if (prefixIdx === -1) {
      prefixIdx = line.length;
    }
    this.prefix = line.slice(0, prefixIdx);
    this.text = line.slice(prefixIdx);
    this.prefixLastChar = this.prefix[this.prefix.length - 1];
    // eslint-disable-next-line prefer-destructuring
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
  let rest = wikitext;
  let startIdx = rest.search(listStartRegex);
  let endIdx;
  let listText;
  while (startIdx !== -1) {
    result += rest.slice(0, startIdx);
    rest = rest.slice(startIdx);
    endIdx = rest.search(listEndRegex);
    if (endIdx === -1) {
      listText = rest.trim('');
      rest = '';
    } else {
      listText = rest.slice(0, endIdx - 1);
      rest = rest.slice(endIdx - 1);
    }
    result += new List(listText).render();
    startIdx = rest.search(listStartRegex);
  }
  result += rest;
  return result;
};
