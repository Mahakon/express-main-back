const express = require('express');
const db = require('../../../../bd/DataBase');
const addNewTask = require('./addNewTask');
const deleteTask = require('./deleteTask');
const updateTaskDiscription = require('./updateTaskDiscription');
const updateSatusTask = require('./updateStatusTask');

const router = express.Router();
const expressWs = require('express-ws')(router);

router.get('/get', (req, res) => {
  db.getTasks(req.query.id)
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
    db.eventGet(req.query.id)
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

module.exports = router;
