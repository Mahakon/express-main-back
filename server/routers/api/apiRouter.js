const express = require('express');

const signUpRouter = require('./sign/up/signUpRouter');
const signInRouter = require('./sign/in/signInRouter');
const userRouter = require('./user/userRouter');

const router = express.Router();

router.use('/sign-in', signInRouter);
router.use('/sign-up', signUpRouter);
router.use('/user', userRouter);

module.exports =router;
