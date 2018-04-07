const express = require('express');

const authRouter = require('./sign/authRouter');
const userRouter = require('./user/userRouter');
const sessionRouter = require('./session/sessionRouter');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/session', sessionRouter);

module.exports =router;
