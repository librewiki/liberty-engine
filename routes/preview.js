'use strict';

const express = require('express');
const router = express.Router();
const Response = require(global.rootdir + '/src/responses');
const WikitextParser = require(global.rootdir + '/src/LibertyParser/src/Parser/WikitextParser');
const { Wikitext } = require(global.rootdir + '/models');

router.post('/',
  async (req, res, next) => {
    try {
      const parser = new WikitextParser();
      const replacedText = await Wikitext.replaceOnSave({
        ipAddress: req.ipAddress,
        author: req.user,
        wikitext: req.body.wikitext,
      });
      const renderResult = await parser.parseRender({ wikitext: replacedText });
      new Response.Success({ html: renderResult.html }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
