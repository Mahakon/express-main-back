const express = require('express');
const multer  = require('multer');
const bd = require('../../../../bd/DataBase');

const upload = multer();
const router = express.Router();

router.get('/', (req, res, next) => {
  if (req.session.user_id !== undefined) {
    res.send({id: req.session.user_id});
  } else {
    if (req.query.mode === 'test') {
      next();
    } else {
      res.send({id: -1});
    }
  }
});


router.post('/', upload.fields([]), (req, res) => {
  const user = req.body;

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

          res.send({id: id});
        },
        err => {
          res.status(500).send({error: err});
        }
      );
  }
});

const getUserIdTestMode = function (req, res) {
  bd.getUserId(req.query.login, req.query.password)
    .then(
      id => {
        if (id === undefined) {
          res.send({id: -1});
        } else {
          res.send({id: id});
        }
      },
      err => {
        res.send({id: -1});
      }
    );
};

router.use(getUserIdTestMode);

module.exports = router;
