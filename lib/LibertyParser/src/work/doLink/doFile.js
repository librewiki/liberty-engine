'use strict';

const models = require('../../../../models');

const mediaRoot = process.env.NODE_ENV === 'development' ? '//localhost:3001/media-dev' : '/media';

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
    if (option.startsWith('link=')) {
      resultObj.linkTo = encodeURIComponent(option.replace('link=', '').trim());
    } else if (option.startsWith('alt=')) {
      resultObj.alt = option.replace('alt=', '').replace(/"/g, '&quot;').trim();
      altPassed = true;
    } else if (['left', 'right', 'center', 'none'].includes(option)) {
      resultObj.horizontal = option;
    } else if (['baseline', 'sub', 'super', 'top', 'text-top', 'middle', 'bottom', 'text-bottom'].includes(option)) {
      resultObj.vertical = option;
    } else if (option === 'border') {
      // with border
      resultObj.classes.push('border');
    } else if (option === 'frame' && !frameOrFrameless) {
      // with frame
      frameOrFrameless = true;
      resultObj.frame = true;
    } else if (option === 'frameless' && !frameOrFrameless) {
      // thumbnail size without frame
      frameOrFrameless = true;
      resultObj.thumb = true;
    } else if (option === 'thumb') {
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

  const { article } = await models.Article.findByFullTitleWithRedirection({
    fullTitle: textToLink,
    caseSensitive: true,
  });
  if (!article) {
    return `<a class="new" href="${resultObj.linkTo}">${textToLink}</a>`;
  }
  const mediaFile = await article.getMediaFile();

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
