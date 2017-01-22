'use strict';

const minimumHeadingsToShowToc = 4;

module.exports = function(wikitext, parsingData) {
  let showToc = parsingData.structureData.numOfHeadings >= minimumHeadingsToShowToc;
  let intermediate = wikitext.replace(/__NOTOC__/g, () => {
    showToc = false;
    return '';
  })
  .replace(/__FORCETOC__/g, () => {
    showToc = true;
    return '';
  });

  if (intermediate.indexOf('__TOC__') !== -1) {
    return intermediate.replace('__TOC__', getToc(parsingData)).replace(/__TOC__/g, '');
  } else if (showToc) {
    return intermediate.replace(/<h[1-6](\s|>)/i, ($0) => {
      return getToc(parsingData) + $0;
    });
  } else {
    return intermediate;
  }
};

function getToc(parsingData) {
  return `<div id="toc" class="toc"><div id="toctitle"><h2>${global.i18n.t('parsing', 'Table of Contents')}</h2></div>
${buildToc(parsingData.structureData.section, parsingData)}
</div>\n`;
}

function buildToc(section, parsingData, levelString) {
  let result = '';
  if (levelString) {
    result += `<li class="toclevel-${section.relativeLevel + 1} tocsection-${++parsingData.structureData.tocSerialNumber}"><a href="#s-${levelString}"><span class="tocnumber">${levelString}</span> <span class="toctext">${section.title}</span></a>\n`;
  }
  if (section.subsections.length) {
    result += '<ul>\n';
    result += section.subsections.map((subsection, i) => {
      let newLevelString = levelString? levelString + '.' + (i + 1) : String(i + 1);
      return buildToc(subsection, parsingData, newLevelString);
    }).join('\n');
    result += '\n</ul>';
  }
  if (section.absoluteLevel !== -1) {
    result += '</li>';
  }
  return result;
}
