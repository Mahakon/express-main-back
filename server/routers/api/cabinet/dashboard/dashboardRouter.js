const express = require('express');
const bd = require('../../../../bd/DataBase');
const addNewTask = require('./addNewTask');
const deleteTask = require('./deleteTask');
const updateTaskDiscription = require('./updateTaskDiscription');
const updateSatusTask = require('./updateStatusTask');
const addCommentTask = require('./addCommentTask');
const fetch = require('node-fetch');
const FormData = require('form-data');
const config = require('../../sign/bitbucket/config');

const router = express.Router();
const expressWs = require('express-ws')(router);


router.get('/getTaskComments', (req, res) => {
  bd.getComments(req.query.id)
    .then(
      value => {
     //   console.log(value);
        res.send(value);
      },
      err => {
    //    console.log(err);
        res.status(500).send({err: err})
      }
    )
});
router.get('/getEvent', (req, res) => {
    bd.eventGet(req.query.id)
        .then(
            value => {
              if (value.length){
                  res.send(value);
              }else{
                  res.send([]);
              }


            },
            err => {
              //  console.log(err);
                res.status(500).send({err: err})
            }
        )
});


// Методы для шаринга
/**
 * @description Метод для перегенерации ссылки
 *
 * @GET
 * @param {number} - project_id - id проекта
 */
router.get('/share/update', (req, res) => {
    bd.generateStringUrlToShare(req.query.project_id).then(
        value => {
            res.status(200).send(value);
        },
        err => res.status(500).send({err: err})
    );
});

/**
 * @description Метод для получения ссылки
 *
 * @GET
 * @param {number} - project_id - id проекта
 */
router.get('/share/get', (req, res) => {
    bd.getStringUrlToShare(req.query.project_id).then(
        value => {
            res.status(200).send({code: value.share_link});
        },
        err => res.status(500).send({err: err})
    );
});

/**
 * @description Метод для получения пользователей
 *
 * @GET
 * @param {number} - project_id - id проекта
 */
router.get('/members/get', (req, res) => {
    bd.getMembers(req.query.project_id).then(
        value => {
            console.log('Members', value);
            res.status(200).send({members: value});
        },
        err => res.status(500).send({err: err})
    );
});

router.get('/share/addUser/:code', (req, res) => {
  if (req.params.code) {
    bd.addProjectAddUser(req.params.code, req.query.id)
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
  }
});


let connections = [];

router.ws('/connection/:id', (ws, req) => {
  const curConn = {id: req.params.id, ws: ws};
  connections.push(curConn);
 // console.log(connections);
  ws.on('message', (msg) => {
    function next(res) {
      connections.forEach((conn) => {
        if (curConn.id == conn.id) {
         // console.log(res);
          conn.ws.send(JSON.stringify(res));
        }
      })
    }

    if (typeof msg === 'string') {
      msg = JSON.parse(msg);
    }
   // console.log(msg);
    switch (msg.event) {
      case 'ADD': {
        addNewTask(curConn.id, msg.task)
          .then(
            task => next({ADD: task, event: task.event})
          );
      } break;

      case 'DELETE': {
        deleteTask(msg.task.id, msg.task)
          .then(
            res => next({DELETE: msg.task, event: res.event})
          )
      } break;

      case 'CHANGE_DISCRIPTION': {
        updateTaskDiscription(msg.task)
          .then(
            res => next({CHANGE_DISCRIPTION: msg.task, event: res.event})
          )
      } break;

      case 'CHANGE_STATUS': {
        updateSatusTask(msg.task, curConn.id, msg)
          .then(
            res => next({CHANGE_STATUS: msg.task, event: res.event})
          )
      } break;

      case 'ADD_COMMENT': {
        addCommentTask(msg.comment)
          .then(
            comment => next({ADD_COMMENT: comment})
          )
      } break;
    }
  });

  ws.on('close', () => {
    console.log('соединение закрыто ' + curConn.id);

    connections = connections.filter(conn => {
      if (conn === curConn) {
        return false;
      }

      return true;
    });
   // console.log(connections);
  });
});

router.get('/get', (req, res, next) => {
  bd.getDataProjectOnBitbucket(req.query.id)
    .then(
      ans => {
        console.log(ans);
        if (ans === undefined) {
          next()
        } else {
          req.acountname = ans.acountname;
          req.slug = ans.slug;
          req.branch = ans.branch;
          next('route');
        }
      },
      err => {
        console.log(err);
        res.status(500).send({err: err})
      }
    )
}, (req, res) => {
  bd.getTasks(req.query.id)
    .then(
      value => {
        console.log(value);
        value = value.map(v => {
          return {
            id: v.id,
            discription: v.discription,
            status: v.status
          }
        });
        res.send(value);
      },
      err => {
        console.log(err);
        res.status(500).send({err: err})
      }
    )
});

const addExtraTasks = function (req, res, next) {
  bd.getBitbucketByUserId(req.query.userId)
    .then(
      data => {
        if (data !== undefined) {
          req.bitbucket = data.bitbucket;
          req.refreshToken = data.refresh_token;
          next();
        } else {
          res.status(404).send({err: 'not found'})
        }
      },
      err => {
        console.log(err);
        res.status(500).send({err: err})
      }
    )
};

router.use(addExtraTasks, (req, res, next) => {
  const url = `https://bitbucket.org/site/oauth2/access_token`;
  let form = new FormData();

  form.append('client_id', config.key);
  form.append('client_secret', config.secret);
  form.append('grant_type', 'refresh_token');
  form.append('refresh_token', req.refreshToken);

  const options = {
    method: 'POST',
    body: form
  };

  fetch(url, options)
    .then(ans => ans.json())
    .then(data => {
      console.log(data);
      req.accessToken = data.access_token;
      return bd.refreshToken(req.bitbucket, data.refresh_token);
    })
    .then(
      success => {
        return bd.getTasks(req.query.id)
      },
      err => {
        console.log(err);
        res.status(500).send({err: err})
      }
    )
    .then(
      tasks => {
        console.log('success update refresh_token');
        const url = `${config.parseServerHost}` +
          `access_token=${req.accessToken}&` +
          `acountname=${req.acountname}&` +
          `slug=${req.slug}&` +
          `branch=${req.branch}&` +
          `tasks=${JSON.stringify(tasks)}`;

        return fetch(url, {
          headers: {'Content-Type':'application/json'},
        });
      },
      err => {
        console.log(err);
        res.status(500).send({err: err});
      }
    )
    .then(
      ans => ans.json()
    )
    .then(
      tasks => {
        console.log(tasks);
        let arr = [];
        tasks.forEach(task => {
          arr.push(addNewTask(req.query.id, task))
        });
        return Promise.all(arr)
      },
      err => {
        console.log(err);
        res.status(500).send({err: err});
      }
    )
    .then(
      success => {
        next();
      },
      err => {
        console.log(err);
        res.status(500).send({err: err});
      }
    )
}, (req, res) => {
  bd.getTasks(req.query.id)
    .then(
      value => {
        console.log(value);
        value = value.map(v => {
          return {
            id: v.id,
            discription: v.discription,
            status: v.status
          }
        });
        res.send(value);
      },
      err => {
        console.log(err);
        res.status(500).send({err: err})
      }
    )
});

module.exports = router;
