const express = require('express');
const userSession = require('../../../sessions/UserSession');
const db = require('../../../bd/DataBase');

const router = express.Router();

router.get('/set', (req, res) => {
  db.isUserInDB(req.query.id)
    .then(
      value => {
        if (!value) {
          res.status(404).send({ error: "not found" });
          res.end();
        }
        req.session.user_id = req.query.id;
        res.send({id: req.session.user_id})
      },
      err => {
        res.status(500).send({ error: err });
      }
    );
});

router.get('/delete', (req, res) => {
  console.log(req.session.id);
  userSession.getSessionStore().destroy(req.session.id, (err) => {
    if (err) {
      res.status(500).send({error: err});
    }
    res.send({result: "success"});
  });
});

module.exports = router;
