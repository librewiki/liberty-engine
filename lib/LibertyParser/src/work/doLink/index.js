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


// const doFile = require('./doFile');

const caseByNamespaceId = {
  0: async function normalCase(textToLink, rest, parsingData) {
    parsingData.structureData.link.articles.add(textToLink);
    let textToShow;
    if (rest.length) {
      textToShow = rest.join('|');
    } else {
      textToShow = textToLink;
    }
    const chached = await cache.get(`article#${textToLink}.exists`);
    if (chached === '1') {
      return `<a href="${textToLink}">${textToShow}</a>`;
    } else if (chached === '0') {
      return `<a href="${textToLink}">${textToShow}</a>`;
    }
    if (await models.Article.existsIncludeRedirection(textToLink)) {
      await cache.set(`article#${textToLink}.exists`, '1');
      await cache.expire(`article#${textToLink}.exists`, 100);
      return `<a href="${textToLink}">${textToShow}</a>`;
    }
    await cache.set(`article#${textToLink}.exists`, '0');
    await cache.expire(`article#${textToLink}.exists`, 100);
    return `<a class="new" href="${textToLink}">${textToShow}</a>`;
  },

  // 2: doFile,

  // 3: async function categoryCase(textToLink, rest, parsingData) {
  //   const exists = await models.Article.existsIncludeRedirection(textToLink);
  //   const { title } = models.Namespace.splitFullTitle(textToLink);
  //   parsingData.structureData.link.categories.add({ title, exists });
  //   return '';
  // },
};

async function doInternalLink(wikitext, parsingData) {
  return stringReplaceAsync.seq(wikitext, /\[\[((.|\|\n)+?)\]\]/ug, async ($0, $1) => {
    const [textToLink, ...rest] = $1.split('|');
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
    if (caseByNamespaceId[namespace.id]) {
      return caseByNamespaceId[namespace.id](textToLink, rest, parsingData);
    }
    return caseByNamespaceId[0](textToLink, rest, parsingData);
  });
}

const externalLinkRegex = /\[\s*((?:(?:http|https|ftp|sftp|gopher|telnet|news|mailto|ed2k|irc|ssh):|magnet:|\/\/).+?)\]/u;
async function doExternalLink(wikitext, parsingData) {
  return stringReplaceAsync.seq(wikitext, externalLinkRegex, async ($0, $1) => {
    const [textToLink, ...rest] = $1.trim().split(' ');
    let textToShow;
    if (rest.length) {
      textToShow = rest.join(' ');
    } else {
      textToShow = parsingData.structureData.numOfExternalLinks;
      parsingData.structureData.numOfExternalLinks += 1;
    }
    return `<a class="external" href="${textToLink}">${textToShow}</a>`;
  });
}

const AutoLinkRegex = /\s((?:(?:http|https|ftp|sftp|gopher|telnet|news|mailto|ed2k|irc|ssh):|magnet:|\/\/).+?)\s/ugi;
async function doAutoLink(wikitext) {
  return stringReplaceAsync.seq(wikitext, AutoLinkRegex, async ($0, $1) => {
    const before = $0.startsWith('\n') ? '\n' : ' ';
    const after = $0.endsWith('\n') ? '\n' : ' ';
    return `${before}<a class="external" href="${$1}">${$1}</a>${after}`;
  });
}

module.exports = async (wikitext, parsingData) => {
  let intermediate = wikitext;
  intermediate = await doInternalLink(intermediate, parsingData);
  intermediate = await doExternalLink(intermediate, parsingData);
  intermediate = await doAutoLink(intermediate, parsingData);
  return intermediate;
};
