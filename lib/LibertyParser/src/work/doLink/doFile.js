'use strict';

const i18n = require('../../../../../i18n');

const mediaRoot = process.env.NODE_ENV === 'development' ? `//localhost:${process.env.PORT || '3001'}/media-dev` : '/media';

function matches(key, target) {
  return i18n.matches(`LibertyParser:FileLinkOption.${key}`, target);
}

function matchesOneOf(keys, target) {
  for (const key of keys) {
    if (matches(key, target)) {
      return key;
    }
  }
  return false;
}

async function doFile(textToLink, rest, parsingData) {
  parsingData.structureData.link.files.add(textToLink);
  const resultObj = {
    linkTo: encodeURIComponent(textToLink),
    alt: textToLink.replace(/"/g, '&quot;'),
    caption: '',
    classes: [],
    frame: false,
    thumb: false,
    horizontal: null,
    width: null,
  };
  const options = [...rest];
  let frameOrFrameless = false;
  let altPassed = false;
  for (const option of options) {
    /* eslint-disable no-cond-assign */
    let matchResult;
    if (option.startsWith('link=')) {
      resultObj.linkTo = encodeURIComponent(option.replace('link=', '').trim());
    } else if (option.startsWith('alt=')) {
      resultObj.alt = option.replace('alt=', '').replace(/"/g, '&quot;').trim();
      altPassed = true;
    } else if (
      matchResult = matchesOneOf([
        'left', 'right', 'center', 'none',
      ], option)
    ) {
      resultObj.horizontal = option;
    } else if (
      matchResult = matchesOneOf([
        'baseline', 'sub', 'super', 'top', 'text-top', 'middle', 'bottom', 'text-bottom',
      ], option)
    ) {
      resultObj.vertical = matchResult;
    } else if (matches('border', option)) {
      // with border
      resultObj.classes.push('border');
    } else if (matches('frame', option) && !frameOrFrameless) {
      // with frame
      frameOrFrameless = true;
      resultObj.frame = true;
    } else if (matches('frameless', option) && !frameOrFrameless) {
      // thumbnail size without frame
      frameOrFrameless = true;
      resultObj.thumb = true;
    } else if (matches('thumb', option)) {
      // thumbnail size with frame
      resultObj.thumb = true;
      resultObj.frame = true;
    } else if (/^\d+px$/.test(option)) {
      [, resultObj.width] = /^(\d+)px$/.exec(option);
    } else if (/^x\d+px$/.test(option)) {
      [, resultObj.height] = /^x(\d+)px$/.exec(option);
    } else if (option) {
      resultObj.caption = option.replace(/"/g, '&quot;');
      if (!altPassed) {
        resultObj.alt = resultObj.caption;
      }
    }
  }

  if (resultObj.thumb && !resultObj.width) {
    resultObj.width = 300;
  }

  const article = await parsingData.parserHelper.articleHelper.find(textToLink);
  if (!article) {
    return `<a class="new" href="${resultObj.linkTo}">${textToLink}</a>`;
  }
  const mediaFile = await article.getMediaFile();
  if (!mediaFile) return `<a class="new" href="${resultObj.linkTo}">${textToLink}</a>`;
  const titleHtml = resultObj.caption ? ` title="${resultObj.caption}"` : '';
  const widthHtml = resultObj.width ? ` width="${resultObj.width}"` : '';
  const heightHtml = resultObj.height ? ` height="${resultObj.height}"` : '';
  const heightStyle = resultObj.height ? ` height: ${resultObj.height}px` : '';
  const mediaPath = `${mediaRoot}/${mediaFile.filename}`;
  let result;
  if (!resultObj.linkTo) {
    result = `<img class="wiki-image" alt="${resultObj.alt}" src="${mediaPath}"${titleHtml}${widthHtml}${heightHtml} style="${heightStyle}">`;
  } else {
    result = `<a class="wiki-image-link" href="${resultObj.linkTo}"${titleHtml}><img class="wiki-image" alt="${resultObj.alt}" src="${mediaPath}"${widthHtml}${heightHtml} style="${heightStyle}"></a>`;
  }
  if (resultObj.frame) {
    result = `<div class="thumb thumb-right"><div class="thumb-inner">${result} <div class="thumb-caption"> ${resultObj.caption} </div></div></div>`;
  }
  return result;
}

module.exports = doFile;
