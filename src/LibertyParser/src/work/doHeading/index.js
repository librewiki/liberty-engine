'use strict';

const headingRegex = /^={1,6}(.+?)(={1,6})$/;
module.exports = function(wikitext, parsingData) {
  let sectionTree = parsingData.structureData.section;
  let lines = wikitext.split('\n');
  let newLines = lines.map((line) => {
    let match = headingRegex.exec(line);
    if (match) {
      parsingData.structureData.numOfHeadings++;
      let level = match[2].length;
      let title = match[1];
      let headingNumber = locateInTree(level, title, sectionTree);
      return `</p>
<h${level}><span id="s-${headingNumber}" class="headline"><a href="#toctitle">${headingNumber}</a> ${title}</span></h${level}>
<p>`;
    } else {
      return line;
    }
  });
  return Promise.resolve(newLines.join('\n'));
};
function locateInTree(absoluteLevel, title, sectionTree, relativeLevel = 0) {
  let last = sectionTree.subsections[sectionTree.subsections.length - 1];
  if (!last || last.absoluteLevel === absoluteLevel) {
    sectionTree.subsections.push({
      title: title,
      relativeLevel: relativeLevel,
      absoluteLevel: absoluteLevel,
      subsections: []
    });
    return sectionTree.subsections.length;
  } else {
    return sectionTree.subsections.length + '.' + locateInTree(absoluteLevel, title, last, relativeLevel + 1);
  }
}
