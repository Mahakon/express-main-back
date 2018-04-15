const express = require('express');

const projectsRouter = require('./projects/projectsRouter');
const dashboardRouter = require('./dashboard/dashboardRouter');

const router = express.Router();

router.use('/projects', projectsRouter);
router.use('/dashboard', dashboardRouter);

module.exports =router;
