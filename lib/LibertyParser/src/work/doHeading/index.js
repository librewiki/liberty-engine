'use strict';

const headingRegex = /^={1,6}(.+?)(={1,6})$/u;

function locateInTree(absoluteLevel, title, sectionTree, relativeLevel = 0) {
  const last = sectionTree.subsections[sectionTree.subsections.length - 1];
  if (!last || last.absoluteLevel === absoluteLevel) {
    sectionTree.subsections.push({
      title,
      relativeLevel,
      absoluteLevel,
      subsections: [],
    });
    return sectionTree.subsections.length;
  }
  return `${sectionTree.subsections.length}.${locateInTree(absoluteLevel, title, last, relativeLevel + 1)}`;
}

module.exports = async (wikitext, parsingData) => {
  const sectionTree = parsingData.structureData.section;
  const lines = wikitext.split('\n');
  const newLines = lines.map((line) => {
    const match = headingRegex.exec(line.trim());
    if (match) {
      parsingData.structureData.numOfHeadings += 1;
      const level = match[2].length;
      const title = (match[1] || '').trim();
      const headingNumber = locateInTree(level, title, sectionTree);
      return `</p>
<h${level}><span id="s-${headingNumber}" class="wiki-heading"><a href="#toc-title">${headingNumber}</a> ${title}</span></h${level}>
<p>`;
    }
    return line;
  });
  return newLines.join('\n');
};
