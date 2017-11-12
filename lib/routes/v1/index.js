'use strict';

const express = require('express');

const router = express.Router({ mergeParams: true });

router.get('/', (req, res, next) => {
  res.json(`Hello, ${req.user.username}!`);
});

const users = require('./users');
const search = require('./search');
const authentication = require('./authentication');
const articles = require('./articles');
const namespaces = require('./namespaces');
const roles = require('./roles');
const revisions = require('./revisions');
const emailConfirm = require('./email-confirm');
const preview = require('./preview');
const discussionTopics = require('./discussion-topics');
const links = require('./links');
const mediaFiles = require('./media-files');
const publicSettings = require('./public-settings');
const settings = require('./settings');
const categories = require('./categories');
const blocks = require('./blocks');

// router.use('/media-dev', express.static(path.join(__dirname, '../../media')));

router.use('/users', users);
router.use('/search', search);
router.use('/authentication', authentication);
router.use('/articles', articles);
router.use('/namespaces', namespaces);
router.use('/roles', roles);
router.use('/revisions', revisions);
router.use('/email-confirm', emailConfirm);
router.use('/preview', preview);
router.use('/discussion-topics', discussionTopics);
router.use('/links', links);
router.use('/media-files', mediaFiles);
router.use('/public-settings', publicSettings);
router.use('/settings', settings);
router.use('/categories', categories);
router.use('/blocks', blocks);

module.exports = router;
