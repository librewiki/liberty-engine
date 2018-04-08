'use strict';

require('../../../bin/www');

setTimeout(async () => {
  const path = require('path');
  process.chdir(path.join(__filename, '/..'));
  const fs = require('fs');
  const { wikitextParser } = require('../');
  const wikitext = fs.readFileSync('./wikitext.txt', 'utf8').trim();
  try {
    console.time('t');
    const result = await wikitextParser.parseRender({ wikitext });
    console.timeEnd('t');
    fs.writeFileSync('./result.txt', result.html);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}, 1500);
