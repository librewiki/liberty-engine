'use strict';

const express = require('express');
const router = express.Router();
const Response = require(global.rootdir + '/src/responses');
const WikitextParser = require(global.rootdir + '/src/LibertyParser/src/Parser/WikitextParser');

router.post('/',
  async (req, res, next) => {
    try {
      const parser = new WikitextParser();
      const renderResult = await parser.parseRender({ wikitext: req.body.wikitext });
      new Response.Success({ html: renderResult.html }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
