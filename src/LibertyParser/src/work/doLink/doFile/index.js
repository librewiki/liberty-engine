'use strict';

const WikiDocument = require(global.moduledir + '/WikiDocument');
const Namespace = require(global.moduledir + '/Namespace');
const cheerio = require('cheerio');
module.exports = function(fileFullTitle, args, parsingData) {
  parsingData.structureData.link.files.add(fileFullTitle);
  let fileName = Namespace.splitIntoIdTitle(fileFullTitle)[1];
  return WikiDocument.exists(fileFullTitle)
  .then((exists) => {
    if (!exists) {
      return `<a class="new" href="/wiki/${fileFullTitle}">${fileFullTitle}</a>`;
    } else {
      let option = {
        inline: true
      };
      let $ = cheerio.load(`<a class="image-link" href="/wiki/${fileFullTitle}"><img src="/file/${fileName}"></a>`);
      let promises = [];
      args.map(arg => arg.trim())
      .forEach((arg) => {
        for (const param of fileParameterList) {
          if (param.test(arg)) {
            promises.push(param.run($, arg, option));
            break;
          }
        }
      });
      return Promise.all(promises)
      .then(() => {
        if (!option.inline) {
          return `</p>\n${$.html()}\n<p>`;
        } else {
          return $.html();
        }
      });
    }
  });
};
const fileParameterList = [
  ...require('./parameters/formats'),
  ...require('./parameters/resizings'),
  ...require('./parameters/alignments'),
];
