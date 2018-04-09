const express = require('express');

const signUpRouter = require('./up/signUpRouter');
const signInRouter = require('./in/signInRouter');
const vkRouter = require('./vk/vkRouter');
const bitbucketRouter = require('./bitbucket/bitbucketRouter');

const router = express.Router();

router.use('/sign-in', signInRouter);
router.use('/sign-up', signUpRouter);
router.use('/vk', vkRouter);
router.use('/bitbucket', bitbucketRouter);

module.exports =router;
