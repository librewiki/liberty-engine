'use strict';

const i18n = require('../../../../../i18n');

const minimumHeadingsToShowToc = 4;


function buildToc(section, parsingData, levelString) {
  let result = '';
  if (levelString) {
    parsingData.structureData.tocSerialNumber += 1;
    result += (
      `<li class="toc-level-${section.relativeLevel + 1} toc-section-${parsingData.structureData.tocSerialNumber}">
<a href="#s-${levelString}"><span class="toc-number">${levelString}</span> <span class="toc-text">${section.title}</span></a>
`
    );
  }
  if (section.subsections.length) {
    result += (
      `<ul>\n${
        section.subsections.map((subsection, i) => {
          const newLevelString = levelString ? `${levelString}.${i + 1}` : String(i + 1);
          return buildToc(subsection, parsingData, newLevelString);
        }).join('\n')
      }\n</ul>`
    );
  }
  if (section.absoluteLevel !== -1) {
    result += '</li>';
  }
  return result;
}

function getToc(parsingData) {
  return (
    `<div id="toc" class="toc">
  <div id="toc-title" class="toc-title">
    <h2>${i18n.t('LibertyParser:TableOfContents')}</h2>
  </div>
${buildToc(parsingData.structureData.section, parsingData)}
</div>
`
  );
}

module.exports = async (wikitext, parsingData) => {
  let showToc = parsingData.structureData.numOfHeadings >= minimumHeadingsToShowToc;
  const intermediate = wikitext
    .replace(/__NOTOC__/ug, () => {
      showToc = false;
      return '';
    })
    .replace(/__FORCETOC__/ug, () => {
      showToc = true;
      return '';
    });

  if (intermediate.indexOf('__TOC__') !== -1) {
    return intermediate.replace('__TOC__', getToc(parsingData)).replace(/__TOC__/ug, '');
  }
  if (showToc) {
    return intermediate.replace(/<h[1-6](\s|>)/ui, $0 => getToc(parsingData) + $0);
  }
  return intermediate;
};
