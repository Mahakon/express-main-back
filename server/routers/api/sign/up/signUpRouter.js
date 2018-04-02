const express = require('express');
const multer  = require('multer');
const bd = require('../../../../bd/DataBase');

const upload = multer();
const router = express.Router();

router.post('/', upload.fields([]), (req, res) => {
  const user = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (user.login === '' || user.password === '' || user.email === '') {
    res.status(404).send({error: "not found"});
  } else {
    bd.addUser(user.login, user.email, user.password)
      .then(
        id => {
          res.send({id: id});
        },
        err => {
          res.status(500).send({error: err});
        }
      );
  }
});

module.exports = router;
