'use strict';

const path = require('path');
const { promisify } = require('util');
const express = require('express');

const router = express.Router();

const { param, body, validationResult } = require('express-validator/check');
const { sanitizeParam, sanitizeBody } = require('express-validator/filter');

const uuidV4 = require('uuid/v4');
const multer = require('multer');
const Response = require('../../responses');
const { UnauthorizedError, MalformedTitleError } = require('../../errors');

const fs = require('fs');

const unlinkAsync = promisify(fs.unlink);
const renameAsync = promisify(fs.rename);

const {
  sequelize,
  Article,
  Namespace,
  MediaFile,
} = require('../../models');

const mediaPath = path.join(__dirname, '..', '..', '..', 'media');
const tempPath = path.join(__dirname, '..', '..', '..', 'media', 'temp');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, tempPath);
  },

  filename(req, file, cb) {
    cb(null, `${uuidV4()}.${file.mimetype.split('/')[1]}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MiB
  },
});

router.get(
  '/:descriptionArticleTitle',
  [
    param('descriptionArticleTitle')
      .trim()
      .custom((v) => {
        if (!Article.validateTitle(v)) {
          throw new MalformedTitleError();
        }
        return v;
      }),
  ],
  [
    sanitizeParam('descriptionArticleTitle').trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return new Response.BadRequest({ errors: errors.array() }).send(res);
      }
      const mediaFile = await MediaFile.findOne({
        include: [{
          association: MediaFile.associations.descriptionArticle,
          where: {
            namespaceId: Namespace.Known.FILE.id,
            title: req.params.descriptionArticleTitle,
          },
        }],
      });
      if (!mediaFile) {
        return new Response.ResourceNotFound().send(res);
      }
      return new Response.Success({ mediaFile: mediaFile.getPublicObject() }).send(res);
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/',
  upload.single('file'),
  [
    body('title')
      .trim()
      .custom((v) => {
        if (!Article.validateTitle(v)) {
          throw new MalformedTitleError();
        }
        return v;
      }),
  ],
  [
    sanitizeBody('title').trim(),
    sanitizeBody('wikitext').trim(),
    sanitizeBody('summary').trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return new Response.BadRequest({ errors: errors.array() }).send(res);
      }
      if (!await req.user.isCreatable(Namespace.Known.FILE)) {
        throw new UnauthorizedError();
      }
      await sequelize.transaction(async (transaction) => {
        const article = await Article.createNew({
          ipAddress: req.ipAddress,
          fullTitle: Namespace.joinNamespaceIdTitle(Namespace.Known.FILE.id, req.body.title),
          author: req.user,
          wikitext: req.body.wikitext,
          summary: req.body.summary,
          transaction,
        });
        await MediaFile.create({
          descriptionArticleId: article.id,
          filename: req.file.filename,
          userId: req.user.id,
          ipAddress: req.ipAddress,
        }, { transaction });
        await renameAsync(req.file.path, path.join(mediaPath, req.file.filename));
      });
      return new Response.Success().send(res);
    } catch (err) {
      fs.stat(req.file.path, async (err) => {
        if (!err) { // temp file exists
          await unlinkAsync(req.file.path);
        }
      });
      return next(err);
    }
  }
);

module.exports = router;
