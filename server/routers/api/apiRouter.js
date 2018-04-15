const express = require('express');

const authRouter = require('./sign/authRouter');
const userRouter = require('./user/userRouter');
const sessionRouter = require('./session/sessionRouter');
const cabinetRouter = require('./cabinet/cabinetRouter');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/session', sessionRouter);
router.use('/cabinet', cabinetRouter);

/*
router.ws('/echo', function(ws, req) {
  ws.on('message', function(msg) {
    ws.send(msg);
  });
});*/

module.exports =router;
