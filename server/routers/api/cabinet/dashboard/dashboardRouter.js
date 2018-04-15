const express = require('express');
const db = require('../../../../bd/DataBase');

const router = express.Router();

router.get('/get', (req, res) => {
  db.getTasks(req.query.id)
    .then(
      value => {
        console.log(value);
        res.send(value)
      },
      err => {
        console.log(err);
        res.status(500).send({err: err})
      }
    )
});

module.exports = router;
