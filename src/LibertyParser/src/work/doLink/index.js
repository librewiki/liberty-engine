'use strict';
const stringReplaceAsync = require('string-replace-async');
const Namespace = require(global.moduledir + '/Namespace');
const WikiDocument = require(global.moduledir + '/WikiDocument');
const Interwiki = require(global.moduledir + '/Interwiki');
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

    let [namespaceId] = Namespace.splitIntoIdTitle(textToLink);
    if (caseByNamespaceId[namespaceId]) {
      return caseByNamespaceId[namespaceId](textToLink, rest, parsingData);
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

const doFile = require('./doFile');

const caseByNamespaceId = {
  0: function normalCase(textToLink, rest, parsingData) {
    let [namespaceId, title] = Namespace.splitIntoIdTitle(textToLink);
    parsingData.structureData.link.normals.add({ namespaceId, title });
    let textToShow;
    if (rest.length) {
      textToShow = rest.join('|');
    } else {
      textToShow = textToLink;
    }
    return WikiDocument.exists(textToLink)
    .then((exists) => {
      if (exists) {
        return `<a href="${textToLink}">${textToShow}</a>`;
      } else {
        return `<a class="new" href="${textToLink}">${textToShow}</a>`;
      }
    });
  },

  2: doFile,

  3: function categoryCase(textToLink, rest, parsingData) {
    return WikiDocument.exists(textToLink)
    .then((exists) => {
      let title = Namespace.splitIntoIdTitle(textToLink)[1];
      parsingData.structureData.link.categories.add({ title, exists });
      return '';
    });
  }

};
