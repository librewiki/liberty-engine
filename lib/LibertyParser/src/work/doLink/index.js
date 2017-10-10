'use strict';

const stringReplaceAsync = require('string-replace-async');

const models = require('../../../../models');
const cache = require('../../../../cache');

// @TODO
const Interwiki = {
  parse() {
    return false;
  },
};


async function doNormal(textToLink, rest, parsingData) {
  parsingData.structureData.link.articles.add(textToLink);
  let textToShow;
  if (rest.length) {
    textToShow = rest.join('|');
  } else {
    textToShow = textToLink;
  }
  const chached = await cache.get(`article#${textToLink}.exists`);
  if (chached === '1') {
    return `<a href="${encodeURIComponent(textToLink)}">${textToShow}</a>`;
  } else if (chached === '0') {
    return `<a class="new" href="${textToLink}">${textToShow}</a>`;
  }
  if (await models.Article.existsWithRedirection({ fullTitle: textToLink, caseSensitive: true })) {
    await cache.set(`article#${textToLink}.exists`, '1');
    await cache.expire(`article#${textToLink}.exists`, 100);
    return `<a href="${encodeURIComponent(textToLink)}">${textToShow}</a>`;
  }
  await cache.set(`article#${textToLink}.exists`, '0');
  await cache.expire(`article#${textToLink}.exists`, 100);
  return `<a class="new" href="${encodeURIComponent(textToLink)}">${textToShow}</a>`;
}

async function doFile(textToLink, rest, parsingData) {
  parsingData.structureData.link.files.add(textToLink);
  const result = await models.Article.findByFullTitleWithRedirection({
    fullTitle: textToLink,
    caseSensitive: true,
  });
  if (!result) {
    return `<a class="new" href="${encodeURIComponent(textToLink)}">${textToLink}</a>`;
  }
  await result.article.getRevisions();
  const mediaFile = await result.article.getMediaFile();
  return `<a class="image" href="${encodeURIComponent(textToLink)}"><img alt="${textToLink}" src="/media/${mediaFile.filename}"></a>`;
}

async function doCategory(textToLink, rest, parsingData) {
  const { title } = models.Namespace.splitFullTitle(textToLink);
  parsingData.structureData.link.categories.add(title);
  return '';
}

async function doInternalLink(wikitext, parsingData) {
  return stringReplaceAsync.seq(wikitext, /\[\[((.|\|\n)+?)\]\]/ug, async ($0, $1) => {
    let [textToLink, ...rest] = $1.split('|');
    let leadingColon = false;
    if (textToLink[0] === ':') {
      textToLink = textToLink.slice(1);
      leadingColon = true;
    }
    let textToShow;
    if (rest.length) {
      textToShow = rest.join('|');
    } else {
      textToShow = textToLink;
    }
    const interwikiInfo = Interwiki.parse(textToLink);
    if (interwikiInfo) {
      parsingData.structureData.link.interwikis.add(interwikiInfo);
      return `<a ${interwikiInfo.isInternal ? '' : ' external '}href="${interwikiInfo.url}">${textToShow}</a>`;
    }
    const { namespace } = models.Namespace.splitFullTitle(textToLink);
    switch (namespace.id) {
      case models.Namespace.Known.FILE.id: {
        if (leadingColon) {
          return doNormal(textToLink, rest, parsingData);
        }
        return doFile(textToLink, rest, parsingData);
      }
      case models.Namespace.Known.CATEGORY.id: {
        if (leadingColon) {
          return doNormal(textToLink, rest, parsingData);
        }
        return doCategory(textToLink, rest, parsingData);
      }
      default: {
        return doNormal(textToLink, rest, parsingData);
      }
    }
  });
}

const externalLinkRegex = /\[\s*((?:(?:http|https|ftp|sftp|gopher|telnet|news|mailto|ed2k|irc|ssh):|magnet:|\/\/).+?)\]/ugi;
async function doExternalLink(wikitext, parsingData) {
  return stringReplaceAsync.seq(wikitext, externalLinkRegex, async ($0, $1) => {
    const [textToLink, ...rest] = $1.trim().split(' ');
    let textToShow;
    if (rest.length) {
      textToShow = rest.join(' ');
    } else {
      parsingData.structureData.numOfExternalLinks += 1;
      textToShow = parsingData.structureData.numOfExternalLinks;
    }
    return `<a class="external" target="_blank" href="${textToLink}" rel="noreferrer noopener">${textToShow}</a>`;
  });
}

const AutoLinkRegex = /\s((?:(?:http|https|ftp|sftp|gopher|telnet|news|mailto|ed2k|irc|ssh):|magnet:|\/\/).+?)\s/ugi;
async function doAutoLink(wikitext) {
  return stringReplaceAsync.seq(wikitext, AutoLinkRegex, async ($0, $1) => {
    const before = $0.startsWith('\n') ? '\n' : ' ';
    const after = $0.endsWith('\n') ? '\n' : ' ';
    return `${before}<a class="external" target="_blank" href="${$1}" rel="noreferrer noopener">${$1}</a>${after}`;
  });
}

module.exports = async (wikitext, parsingData) => {
  let intermediate = wikitext;
  intermediate = await doInternalLink(intermediate, parsingData);
  intermediate = await doExternalLink(intermediate, parsingData);
  intermediate = await doAutoLink(intermediate, parsingData);
  return intermediate;
};
