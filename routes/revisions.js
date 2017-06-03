'use strict';

const express = require('express');
const router = express.Router();
const { Revision } = require(global.rootdir + '/models');
const Response = require(global.rootdir + '/src/responses');

router.get('/:revisionId',
  async (req, res, next) => {
    try {
      const revision = await Revision.findById(req.params.revisionId, {
        include: [
          Revision.associations.author,
          Revision.associations.wikitext
        ]
      });
      if (!revision) {
        return new Response.ResourceNotFound().send(res);
      }
      return new Response.Success({
        revision: {
          id: revision.id,
          changedLength: revision.changedLength,
          createdAt: revision.createdAt,
          summary: revision.summary,
          authorName: revision.author? revision.author.username : null,
          ipAddress: revision.author? null : revision.ipAddress,
          wikitext: revision.wikitext.text
        }
      }).send(res);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
