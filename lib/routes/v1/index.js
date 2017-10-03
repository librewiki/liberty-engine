'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

router.get('/', (req, res, next) => {
  res.json(`Hello, ${req.user.username}!`);
});

const users = require('./users');
const search = require('./search');
const authentication = require('./authentication');
const siteNotice = require('./site-notice');
const frontPage = require('./front-page');
const articles = require('./articles');
const namespaces = require('./namespaces');
const roles = require('./roles');
const revisions = require('./revisions');
const mailConfirm = require('./mail-confirm');
const preview = require('./preview');
const discussionTopics = require('./discussion-topics');
const links = require('./links');
const mediaFiles = require('./media-files');
const publicSettings = require('./public-settings');

// router.use('/media-dev', express.static(path.join(__dirname, '../../media')));

router.use('/users', users);
router.use('/search', search);
router.use('/authentication', authentication);
router.use('/site-notice', siteNotice);
router.use('/front-page', frontPage);
router.use('/articles', articles);
router.use('/namespaces', namespaces);
router.use('/roles', roles);
router.use('/revisions', revisions);
router.use('/mail-confirm', mailConfirm);
router.use('/preview', preview);
router.use('/discussion-topics', discussionTopics);
router.use('/links', links);
router.use('/media-files', mediaFiles);
router.use('/public-settings', publicSettings);

module.exports = router;
