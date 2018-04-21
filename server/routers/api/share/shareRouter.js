const express = require('express');
const bd = require('../../../bd/DataBase');


const router = express.Router();


router.get('/:code', (req, res) => {
    console.log(req.params.code);
});

module.exports = router;
