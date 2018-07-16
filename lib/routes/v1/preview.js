'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });
const Response = require('../../responses');
const WikitextParser = require('../../LibertyParser/src/Parser/WikitextParser');
const { Wikitext } = require('../../models');

router.post(
  '/',
  async ({ user, ipAddress, body: { wikitext } }, res, next) => {
    try {
      const parser = new WikitextParser();
      const replacedText = await Wikitext.replaceOnSave({
        author: user,
        ipAddress,
        wikitext,
      });
      const renderResult = await parser.parseRender({ wikitext: replacedText });
      new Response.Success({ html: renderResult.html }).send(res);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
