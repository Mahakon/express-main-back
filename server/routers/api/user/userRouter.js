const express = require('express');
const db = require('../../../bd/DataBase');
const userSession = require('../../../sessions/UserSession');

const router = express.Router();
let sessionId;

router.get('/:id', (req, res) => {
  sessionId = req.session.id;
  //res.setHeader('Access-Control-Allow-Origin', '*');
  db.isUserInDB(req.params.id)
    .then(
      value => {
        if (!value) {
          res.status(404).send({ error: "not found" });
          return;
        }
        req.session.user_id = req.params.id;
        db.getUserLogin(req.params.id)
          .then(
            login => {
              console.log(login);
              res.send({login: login});
            },
            err => {
              console.log(err);
              res.status(500).send({ error: err });
            }
          )
      },
      err => {
        console.log(err);
        res.status(500).send({ error: err });
      }
    );
});

router.post('/:id/logout', (req, res) => {
  //res.setHeader('Access-Control-Allow-Origin', '*');
  userSession.getSessionStore().destroy(sessionId, (err) => {
    if (err) {
      console.log(err);
      res.send({err: err})
      res.end();
    }
    res.send({result: "success"});
  });
});

module.exports = router;
