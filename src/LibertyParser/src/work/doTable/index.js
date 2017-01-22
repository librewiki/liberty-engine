'use strict';

const tableFindRegex = /\n{\|(?:(?:.|\n)+?)\n\|}/g;
module.exports = function(wikitext, parsingData) {
  let result = wikitext.replace(tableFindRegex, ($0) => {
    return new Table($0).render();
  });
  return Promise.resolve(result);
};

const attrRegex = /(class|style|align|colspan|rowspan)=\"(.+?)\"/gi;

class TableElement {
  constructor() {
    this.attrs = [];
  }

  renderAttributes() {
    if (this.attrs.length) {
      return ' ' + this.attrs.join(' ');
    } else {
      return '';
    }
  }

  setAttributes(text) {
    this.attrs = text.trim().match(attrRegex);
    if (this.attrs === null) {
      this.attrs = [];
    }
  }
}



class Table extends TableElement {
  constructor(text) {
    super();
    let lines = text.trim().split('\n');
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

      if (line.startsWith('|') || line.startsWith('!')) {
        splitPushCells(line, lastRow.cells);
        return;
      } else {
        let lastCell = lastRow.cells[lastRow.cells.length - 1];
        if (!lastCell) {
          this.pretext += '\n' + line;
        } else {
          lastRow.cells[lastRow.cells.length - 1].text += ('\n' + line);
        }
      }
    });
  }

  render() {
    return `</p>${this.pretext}
<table${this.renderAttributes()}>${this.caption? '\n' + this.caption.render() : ''}
${this.rows.filter(row => row.cells.length).map(row => row.render()).join('\n')}
</table>
<p>`;
  }

}

function splitPushCells(line, cells) {
  let match = line.match(/\|\||!!/);
  if (match) {
    let idx = match.index;
    cells.push(new Cell(line.slice(0, idx)));
    return splitPushCells(line.slice(idx + 1), cells);
  } else {
    cells.push(new Cell(line));
  }
}


class Caption extends TableElement {
  constructor(line) {
    super();
    let pipeIdx = line.indexOf('|');
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
    return `<tr${this.renderAttributes()}>
${this.cells.map(cell => cell.render()).join('\n')}
</tr>`;
  }
}

class Cell extends TableElement {
  constructor(line) {
    super();
    this.tag = line[0] === '|' ? 'td' : 'th';
    let pipeIdx = line.indexOf('|', 1);
    if (pipeIdx !== -1) {
      this.setAttributes(line.slice(1), pipeIdx);
      this.text = line.slice(pipeIdx + 1).trim();
    } else {
      this.text = line.slice(1).trim();
    }
  }
  render() {
    return `<${this.tag}${this.renderAttributes()}>${this.text}
</${this.tag}>`;
  }
}
