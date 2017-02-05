'use strict';

const i18next = require('i18next');
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
  return (
`<div id="toc" class="liberty-toc">
  <div id="toc-title">
    <h2>${i18next.t('LibertyParser:TableOfContents')}</h2>
  </div>
${buildToc(parsingData.structureData.section, parsingData)}
</div>
`
  );
}

function buildToc(section, parsingData, levelString) {
  let result = '';
  if (levelString) {
    result += (
`<li class="liberty-toc-level-${section.relativeLevel + 1} liberty-toc-section-${++parsingData.structureData.tocSerialNumber}">
<a href="#s-${levelString}"><span class="liberty-toc-number">${levelString}</span> <span class="liberty-toc-text">${section.title}</span></a>
`
    );
  }
  if (section.subsections.length) {
    result += (
`<ul>
${
  section.subsections.map((subsection, i) => {
    let newLevelString = levelString? `${levelString}.${i + 1}` : String(i + 1);
    return buildToc(subsection, parsingData, newLevelString);
  }).join('\n')
}
</ul>`
    );
  }
  if (section.absoluteLevel !== -1) {
    result += '</li>';
  }
  return result;
}
