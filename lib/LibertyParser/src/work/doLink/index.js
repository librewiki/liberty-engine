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

const doFile = require('./doFile');

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

const externalLinkRegex = /\[\s*((?:(?:http|https|ftp|sftp|gopher|telnet|ed2k|irc|ssh):|news:|mailto:|magnet:|\/\/).+?)\]/ugi;
async function doExternalLink(wikitext, parsingData) {
  return wikitext.replace(externalLinkRegex, ($0, $1) => {
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

const autoLinkRegex = /([\s<>])((?:(?:http|https|ftp|sftp|gopher|telnet|ed2k|irc|ssh):|news:|mailto:|magnet:|\/\/).+?)([\s<>])/ugi;
async function doAutoLink(wikitext) {
  return wikitext.replace(
    autoLinkRegex,
    ($0, before, content, after) =>
      `${before}<a class="external" target="_blank" href="${content}" rel="noreferrer noopener">${content}</a>${after}`
  );
}

module.exports = async (wikitext, parsingData) => {
  let intermediate = wikitext;
  intermediate = await doInternalLink(intermediate, parsingData);
  intermediate = await doExternalLink(intermediate, parsingData);
  intermediate = await doAutoLink(intermediate, parsingData);
  return intermediate;
};
