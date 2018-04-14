const express = require('express');
const db = require('../../../bd/DataBase');
const userSession = require('../../../sessions/UserSession');
const multer  = require('multer');
const router = express.Router();
let sessionId;
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './static/public/dist/avatars/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
const upload = multer({ //multer settings
    storage: storage
});

// Проверка есть ти подобные свойства
router.post('/data/check/', (req, res) => {
    // console.log('тест', req.query);
    if (req.body.name === 'email' || req.body.name === 'login') {
        db.checkName(req.body.name, req.body.value)
            .then(
                status => {
                    res.status(200).send({ success: true, result: status});
                },
                err => {
                    res.status(500).send({ error: err });
                }
            )
    }else{
        res.status(500).send({ error: "Не задано имя поля" });
    }
});

router.delete('/:id/delAvatar/', (req, res) => {
    db.isUserInDB(req.params.id)
        .then(
            value => {
                if (!value) {
                    res.status(404).send({ error: "not found" });
                    return;
                }

                db.updateUserAvatar(req.params.id, ``)
                    .then(
                        status => {
                            res.status(200).send({ success: true, src: null });
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
              ([login, name, surname, avatar]) => {
                  res.send({
                      login: login,
                      name: name,
                      surname: surname,
                      avatar: avatar
                  });
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



router.post('/:id/updateAvatar/', upload.single('avatar'), (req, res) => {
    db.isUserInDB(req.params.id)
        .then(
            value => {
                if (!value) {
                    res.status(404).send({ error: "not found" });
                    return;
                }

                db.updateUserAvatar(req.params.id, `/avatars/${req.file.filename}`)
                    .then(
                        status => {
                            // console.log(req);
                            res.status(200).send({ success: true, src: `/avatars/${req.file.filename}` });
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

router.post('/:id/updatePassword/', upload.fields([]), (req, res) => {
    db.isUserInDB(req.params.id)
        .then(
            value => {
                if (!value) {
                    res.status(404).send({ error: "not found" });
                    return;
                }

                db.updateUserPassword(req.params.id, req.body.old_password, req.body.password)
                    .then(
                        status => {
                            // console.log(req);
                            res.status(200).send({ success: status });
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

router.post('/:id/update/', upload.fields([]), (req, res) => {
   // console.log(JSON.stringify(req));
    db.isUserInDB(req.params.id)
    .then(
      value => {
        if (!value) {
          res.status(404).send({ error: "not found" });
          return;
        }

        db.updateUserInfo(req.params.id, req.body.login, req.body.name, req.body.surname)
          .then(
            status => {
             // console.log(req);
              res.status(200).send({ success: status });
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
