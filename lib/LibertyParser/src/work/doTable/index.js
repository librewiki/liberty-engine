'use strict';

const attrRegex = /(class|style|align|colspan|rowspan)="(.+?)"/ugi;

class TableElement {
  constructor() {
    this.attrs = [];
  }

  renderAttributes() {
    if (this.attrs.length) {
      return ` ${this.attrs.join(' ')}`;
    }
    return '';
  }

  setAttributes(text) {
    this.attrs = text.trim().match(attrRegex);
    if (this.attrs === null) {
      this.attrs = [];
    }
  }
}

class Caption extends TableElement {
  constructor(line) {
    super();
    const pipeIdx = line.indexOf('|', 1);
    if (pipeIdx !== -1) {
      this.setAttributes(line.slice(2), pipeIdx);
      this.text = line.slice(pipeIdx + 1).trim();
    } else {
      this.text = line.slice(2).trim();
    }
  }

  render() {
    return `<caption${this.renderAttributes()}>${this.text}</caption>`;
  }
}

class Row extends TableElement {
  constructor(line) {
    super();
    this.setAttributes(line.slice(1));
    this.cells = [];
  }

  render() {
    return `<tr${this.renderAttributes()}>${this.cells.map(cell => cell.render()).join('\n')}</tr>`;
  }
}

class Cell extends TableElement {
  constructor(line) {
    super();
    this.tag = line[0] === '|' ? 'td' : 'th';
    const pipeIdx = line.indexOf('|', 1);
    if (pipeIdx !== -1) {
      this.setAttributes(line.slice(1), pipeIdx);
      this.text = line.slice(pipeIdx + 1).trim();
    } else {
      this.text = line.slice(1).trim();
    }
  }

  render() {
    return `<${this.tag}${this.renderAttributes()}>${this.text}</${this.tag}>`;
  }
}


class Table extends TableElement {
  constructor(text) {
    super();
    const lines = text.trim().split('\n');
    this.rows = [];
    this.pretext = '';
    this.setAttributes(lines[0].slice(2));
    lines.forEach((line, i) => {
      if (i === 0) {
        return;
      }

      if (i === lines.length - 1) {
        return;
      }

      if (line.startsWith('|+')) {
        this.caption = new Caption(line);
        return;
      }

      if (line.startsWith('|-')) {
        this.rows.push(new Row(line));
        return;
      }

      let lastRow = this.rows[this.rows.length - 1];
      if (!lastRow) {
        this.rows.push(new Row(''));
        lastRow = this.rows[this.rows.length - 1];
      }

      if (line.startsWith('|')) {
        Table.splitPushCells(line, lastRow.cells, false);
      } else if (line.startsWith('!')) {
        Table.splitPushCells(line, lastRow.cells, true);
      } else {
        const lastCell = lastRow.cells[lastRow.cells.length - 1];
        if (!lastCell) {
          this.pretext += `\n${line}`;
        } else {
          lastRow.cells[lastRow.cells.length - 1].text += (`\n${line}`);
        }
      }
    });
  }

  render() {
    return `</p>${this.pretext}<table${this.renderAttributes()}>${this.caption ? `\n${this.caption.render()}` : ''}${this.rows.filter(row => row.cells.length).map(row => row.render()).join('\n')}</table><p>`;
  }

  /* ||, !! */
  static splitPushCells(line, cells, isTh) {
    let match;
    if (isTh) {
      match = line.match(/\|\||!!/u);
    } else {
      match = line.match(/\|\|/u);
    }
    if (match) {
      const idx = match.index;
      cells.push(new Cell(line.slice(0, idx)));
      if (isTh) {
        this.splitPushCells(`!${line.slice(idx + 2)}`, cells, true);
      } else {
        this.splitPushCells(line.slice(idx + 1), cells, false);
      }
    } else {
      cells.push(new Cell(line));
    }
  }
}


module.exports = async (wikitext) => {
  const tableRegex = /^\{\||\|\}/umg;
  let rest = wikitext;
  let stack = [];
  let matched = tableRegex.exec(rest);
  while (matched) {
    if (matched[0] === '{|') {
      stack.push(matched.index);
    } else if (stack.length) {
      const openIdx = stack.pop();
      const closeIdx = matched.index;
      rest = rest.slice(0, openIdx)
        + new Table(rest.slice(openIdx, closeIdx + 2)).render()
        + rest.slice(closeIdx + 2);
      stack = [];
      tableRegex.lastIndex = 0;
    }
    matched = tableRegex.exec(rest);
  }
  return rest;
};
