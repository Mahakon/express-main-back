const express = require('express');

const authRouter = require('./sign/authRouter');
const userRouter = require('./user/userRouter');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);

module.exports =router;
