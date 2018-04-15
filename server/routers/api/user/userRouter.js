const express = require('express');
const db = require('../../../bd/DataBase');
const userSession = require('../../../sessions/UserSession');

const router = express.Router();

router.get('/data', (req, res) => {
  let data = {
    login: '',
    projects: []
  };
  db.isUserInDB(req.query.id)
    .then(
      value => {
        if (!value) {
          res.status(404).send({ error: "not found" });
        }

        db.getUserLogin(req.query.id)
          .then(
            login => {
              data.login = login;
              return db.getProjects(req.query.id)
            },
            err => {
              console.log(err);
              res.status(500).send({err: err});
            }
          )
          .then(
            projects => {
              data.projects = projects;
              res.send(data);
            },
            err => {
              console.log(err);
              res.status(500).send({err: err});
            }
          )

      },
      err => {
        res.status(500).send({ error: err });
      }
    );
});

module.exports = router;
