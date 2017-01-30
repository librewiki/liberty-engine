'use strict';
const stringReplaceAsync = require('string-replace-async');
const models = require(global.rootdir + '/models');

//@TODO
let Interwiki = {
  parse() {
    return false;
  }
};

module.exports = function(wikitext, parsingData) {
  return Promise.resolve(wikitext)
  .then((intermediate) => doInternalLink(intermediate, parsingData))
  .then((intermediate) => doExternalLink(intermediate, parsingData))
  .then((intermediate) => doAutoLink(intermediate, parsingData));
};

function doInternalLink(wikitext, parsingData) {
  return stringReplaceAsync.seq(wikitext, /\[\[((.|\|\n)+?)\]\]/g, ($0, $1) => {
    let [textToLink, ...rest] = $1.split('|');
    let textToShow;
    if (rest.length) {
      textToShow = rest.join('|');
    } else {
      textToShow = textToLink;
    }
    let interwikiInfo = Interwiki.parse(textToLink);
    if (interwikiInfo) {
      parsingData.structureData.link.interwikis.add(interwikiInfo);
      return Promise.resolve(`<a ${interwikiInfo.isInternal? '' : ' external '}href="${interwikiInfo.url}">${textToShow}</a>`);
    }
    let { namespace } = models.Namespace.splitFullTitle(textToLink);
    if (caseByNamespaceId[namespace.id]) {
      return caseByNamespaceId[namespace.id](textToLink, rest, parsingData);
    } else {
      return caseByNamespaceId[0](textToLink, rest, parsingData);
    }
  });
}

const externalLinkRegex = /\[\s*((?:(?:http|https|ftp|sftp|gopher|telnet|news|mailto|ed2k|irc|ssh):|magnet:|\/\/).+?)\]/;
function doExternalLink(wikitext, parsingData) {
  return stringReplaceAsync.seq(wikitext, externalLinkRegex, ($0, $1) => {
    let [textToLink, ...rest] = $1.trim().split(' ');
    let textToShow;
    if (rest.length) {
      textToShow = rest.join(' ');
    } else {
      textToShow = ++parsingData.structureData.numOfExternalLinks;
    }
    return Promise.resolve(`<a class="external" href="${textToLink}">${textToShow}</a>`);
  });
}

const AutoLinkRegex = /\s((?:(?:http|https|ftp|sftp|gopher|telnet|news|mailto|ed2k|irc|ssh):|magnet:|\/\/).+?)\s/gi;
function doAutoLink(wikitext, parsingData) {
  return stringReplaceAsync.seq(wikitext, AutoLinkRegex, ($0, $1) => {
    let before = $0.startsWith('\n')? '\n' : ' ';
    let after = $0.endsWith('\n')? '\n' : ' ';
    return Promise.resolve(`${before}<a class="external" href="${$1}">${$1}</a>${after}`);
  });
}

// const doFile = require('./doFile');

const caseByNamespaceId = {
  0: function normalCase(textToLink, rest, parsingData) {
    let { namespace, title } = models.Namespace.splitFullTitle(textToLink);
    parsingData.structureData.link.normals.add({ namespaceId: namespace.id, title });
    let textToShow;
    if (rest.length) {
      textToShow = rest.join('|');
    } else {
      textToShow = textToLink;
    }
    return models.Article.existsIncludeRedirection(textToLink)
    .then((exists) => {
      if (exists) {
        return `<a href="${textToLink}">${textToShow}</a>`;
      } else {
        return `<a class="new" href="${textToLink}">${textToShow}</a>`;
      }
    });
  },

  // 2: doFile,

  3: function categoryCase(textToLink, rest, parsingData) {
    return models.Article.existsIncludeRedirection(textToLink)
    .then((exists) => {
      let { title } = models.Namespace.splitFullTitle(textToLink);
      parsingData.structureData.link.categories.add({ title, exists });
      return '';
    });
  }

};
