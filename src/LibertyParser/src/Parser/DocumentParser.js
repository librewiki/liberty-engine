'use strict';

const LibertyParser = require('./LibertyParser');
const ParsingData = require('../ParsingData');
const LibertyParserSupporter = require('../ParserSupporter').LibertyParserSupporter;
const wikiMetadata = {
  siteName: global.LS.site_name,
  serverDomain: global.LS.server_domain,
  libertyVersion: global.LIBERTY_VERSION
};

class DocumentParser extends LibertyParser {
  parseRender({ wikiDocument, version, noRedirect }) {
    return wikiDocument.getVersion(version? version : undefined)
    .then((version) => {
      if (!noRedirect) {
        let destination = version.getRedirectingDestination();
        if (destination) {
          return { redirectTo: destination };
        }
      }
      let parsingData = new ParsingData(wikiDocument, wikiMetadata, LibertyParserSupporter);
      return super.parseRender({ wikitext: version.wikitext, parsingData: parsingData});
    });
  }
}

module.exports = DocumentParser;
