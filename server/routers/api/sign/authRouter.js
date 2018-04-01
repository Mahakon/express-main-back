const express = require('express');

const signUpRouter = require('./up/signUpRouter');
const signInRouter = require('./in/signInRouter');

const router = express.Router();

router.use('/sign-in', signInRouter);
router.use('/sign-up', signUpRouter);

module.exports =router;
