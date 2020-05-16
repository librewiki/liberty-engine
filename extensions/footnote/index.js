'use strict';

const striptags = require('striptags');
const ArrayMap = require('../../lib/utils/ArrayMap');

function registerFootnote($item, parsingData) {
  const { footnoteGroups } = parsingData.structureData;
  const lastFootnoteGroup = footnoteGroups[footnoteGroups.length - 1];
  const footnoteName = $item.attr('name');
  $item.find('ref').remove();
  const content = $item.html().trim();

  if (footnoteName === undefined) {
    parsingData.structureData.numOfFootnotes += 1;
    const footnote = {
      isNamed: false,
      absoluteNumber: parsingData.structureData.numOfFootnotes,
      relativeNumber: lastFootnoteGroup.size + 1,
      content,
      stripedContent: striptags(content).replace(/"/g, '&quot;'),
    };
    lastFootnoteGroup.push(footnote);
    return `<sup id="footnote-${footnote.absoluteNumber}-back" title="${footnote.stripedContent}"><a href="#footnote-${footnote.absoluteNumber}">[${footnote.relativeNumber}]</a></sup>`;
  }

  let footnote = lastFootnoteGroup.get(footnoteName);
  if (footnote) {
    footnote.innerNumber += 1;
  } else {
    parsingData.structureData.numOfFootnotes += 1;
    footnote = {
      innerNumber: 0,
      isNamed: true,
      absoluteNumber: parsingData.structureData.numOfFootnotes,
      relativeNumber: lastFootnoteGroup.size + 1,
      content,
      stripedContent: striptags(content).replace(/"/g, '&quot;'),
    };
    lastFootnoteGroup.set(footnoteName, footnote);
  }
  return `<sup id="footnote-${footnoteName}_${footnote.absoluteNumber}-${footnote.innerNumber}-back" title="${footnote.stripedContent}"><a href="#footnote-${footnoteName}_${footnote.absoluteNumber}">[${footnote.relativeNumber}]</a></sup>`;
}

function showFootnotes($item, parsingData) {
  const { footnoteGroups } = parsingData.structureData;
  if (!footnoteGroups || !footnoteGroups.length) {
    return '';
  }
  const lastFootnoteGroup = footnoteGroups[footnoteGroups.length - 1];
  footnoteGroups.push(new ArrayMap());
  const rows = [];
  for (const [key, footnote] of lastFootnoteGroup) {
    if (footnote.isNamed) {
      let row = `<li id="footnote-${key}_${footnote.absoluteNumber}"><span>↑`;
      for (let i = 0; i <= footnote.innerNumber; i += 1) {
        row += ` <sup><a href="#footnote-${key}_${footnote.absoluteNumber}-${i}-back">${footnote.relativeNumber}.${i}</a></sup>`;
      }
      row += `</span> <span>${footnote.content}</span>`;
      rows.push(row);
    } else {
      rows.push(`<li id="footnote-${footnote.absoluteNumber}"><span><a href="#footnote-${footnote.absoluteNumber}-back">↑</a></span> <span>${footnote.content}</span>`);
    }
  }
  return `<ol class="references">\n${rows.join('\n')}\n</ol>`;
}

function hook($item, parsingData) {
  if (!parsingData.structureData.footnoteGroups) {
    parsingData.structureData.footnoteGroups = [new ArrayMap()];
    parsingData.structureData.numOfFootnotes = 0;
  }
  const tagName = $item[0].name;
  if (tagName === 'references') {
    return showFootnotes($item, parsingData);
  }
  return registerFootnote($item, parsingData);
}

function handleNoReferences(intermediate, parsingData) {
  return intermediate + showFootnotes(null, parsingData);
}

module.exports.import = (helper) => {
  helper.parserHook.setXmlHook({
    type: 'afterParsing',
    selector: 'ref,references',
    hook,
  });
  helper.parserHook.setHook({ type: 'afterParsing', hook: handleNoReferences });
};
