const express = require('express');
const multer  = require('multer');
const bd = require('../../../../bd/DataBase');

const upload = multer();
const router = express.Router();

router.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.session.user_id) {
    res.send({id: req.session.user_id});
  } else {
    res.send({id: -1});
  }
});

router.post('/', upload.fields([]), (req, res) => {
  const user = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (user.login === '' || user.password === '') {
    res.status(404).send({ error: "not found" });
  } else {
    bd.getUserId(user.login, user.password)
      .then(
        id => {
          if (id === undefined) {
            res.status(404).send({error: "not found"});
            return;
          }

          if (req.session.user_id) {
            req.session.user_id = id;
            req.session.save();
          }
          res.send({id: id});
        },
        err => {
          res.status(500).send({error: err});
        }
      );
  }
});

module.exports = router;
