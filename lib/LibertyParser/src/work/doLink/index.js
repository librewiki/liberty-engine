'use strict';

// @TODO
const Interwiki = {
  parse() {
    return false;
  },
};

async function doNormal(textToLink, rest, leadingColon, parsingData) {
  parsingData.structureData.link.articles.add(textToLink);
  let textToShow;
  if (rest.length) {
    textToShow = rest.join('|');
  } else {
    textToShow = textToLink;
  }
  textToLink = textToLink.trim();
  if (!leadingColon && textToLink[0] === '/') {
    // @TODO preview support
    textToLink = parsingData.articleMetadata.fullTitle + textToLink;
  }
  if (await parsingData.parserHelper.articleHelper.exists(textToLink)) {
    return `<a href="${encodeURIComponent(textToLink)}">${textToShow}</a>`;
  }
  return `<a class="new" href="${encodeURIComponent(textToLink)}">${textToShow}</a>`;
}

const doFile = require('./doFile');

async function doCategory(textToLink, rest, parsingData) {
  const { title } = parsingData.parserHelper.splitFullTitle(textToLink);
  parsingData.structureData.link.categories.add(title);
  return '';
}

async function replacer(parsingData, $0, $1) {
  const trimmed = $1.trim();
  let [textToLink, ...rest] = trimmed.split('|');
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
  const { namespace } = parsingData.parserHelper.splitFullTitle(textToLink);
  switch (namespace.id) {
    case parsingData.wikiMetadata.KnownNamespaces.FILE.id: {
      if (leadingColon) {
        return doNormal(textToLink, rest, leadingColon, parsingData);
      }
      return doFile(textToLink, rest, parsingData);
    }
    case parsingData.wikiMetadata.KnownNamespaces.CATEGORY.id: {
      if (leadingColon) {
        return doNormal(textToLink, rest, leadingColon, parsingData);
      }
      return doCategory(textToLink, rest, parsingData);
    }
    default: {
      return doNormal(textToLink, rest, leadingColon, parsingData);
    }
  }
}


async function doInternalLink(wikitext, parsingData) {
  const regex = /\[\[((?:.|\n)+?)\]\]/ug;

  const matches = [];
  let match;
  regex.lastIndex = 0;
  /* eslint-disable no-cond-assign */
  while ((match = regex.exec(wikitext)) !== null) {
    matches.push(match);
  }
  /* eslint-enable no-cond-assign */
  const linkRendered = [];
  for (const [$0, $1] of matches) {
    linkRendered.push(await replacer(parsingData, $0, $1));
  }
  const parts = wikitext.split(regex); // [..., m0, ..., m1, ...]
  return parts.map((v, i) => {
    if (i % 2 === 1) {
      return linkRendered[(i - 1) / 2];
    }
    return v;
  }).join('');
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
    ($0, before, content, after) => `${before}<a class="external" target="_blank" href="${content}" rel="noreferrer noopener">${content}</a>${after}`,
  );
}

module.exports = async (wikitext, parsingData) => {
  let intermediate = wikitext;
  intermediate = await doInternalLink(intermediate, parsingData);
  intermediate = await doExternalLink(intermediate, parsingData);
  intermediate = await doAutoLink(intermediate, parsingData);
  return intermediate;
};
