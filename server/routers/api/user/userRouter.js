const express = require('express');
const db = require('../../../bd/DataBase');
const userSession = require('../../../sessions/UserSession');

const router = express.Router();
let sessionId;

router.get('/:id', (req, res) => {
  sessionId = req.session.id;
  db.isUserInDB(req.params.id)
    .then(
      value => {
        if (!value) {
          res.status(404).send({ error: "not found" });
          return;
        }
        db.getUserLogin(req.params.id)
          .then(
            login => {
              res.send({login: login});
            },
            err => {
              res.status(500).send({ error: err });
            }
          )
      },
      err => {
        res.status(500).send({ error: err });
      }
    );
});

module.exports = router;
