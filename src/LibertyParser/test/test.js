'use strict';
require('../../../bin/www');
setTimeout(() => {
  const path = require('path');
  process.chdir(path.join(__filename, '/..'));
  const fs = require('fs');
  const wikitextParser = require('../').wikitextParser;
  const wikitext = fs.readFileSync('./wikitext.txt', 'utf8').trim();
  wikitextParser.parseRender({ wikitext: wikitext })
  .then((result) => {
    console.log(result);
    fs.writeFileSync('./result.txt', result.html);
  })
  .catch((err) => {
    console.log(err);
  })
  .then(() => {
    process.exit(0);
  });
}, 1500);
