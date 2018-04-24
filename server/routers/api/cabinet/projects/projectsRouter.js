const express = require('express');
const multer  = require('multer');
const bd = require('../../../../bd/DataBase');
const bitprojectsRouter = require('./bitProjectsRouter');
const fetch = require('node-fetch');
const FormData = require('form-data');
const config = require('../../sign/bitbucket/config');
const addNewTask = require('../dashboard/addNewTask');

const upload = multer();
const router = express.Router();

router.use('/bitbucket', bitprojectsRouter);

router.post('/add', upload.fields([]), (req, res, next) => {
  const project = req.body;

  bd.addProject(project.userId,
                project.title,
                project.acountname,
                project.slug,
                project.branch)
    .then(
      id => {
        if (project.acountname === undefined) {
          res.send({
            id: id,
            title: project.title
          });
        } else {
          req.projectId = id;
          req.projectTitle = project.title;
          req.acountname = project.acountname;
          req.slug = project.slug;
          req.userId = project.userId;
          req.branch = project.branch;
          next();
        }

      },
      err => {
        console.log(err);
        res.status(500).send(err);
      }
    )
}, (req, res, next) => {
  bd.getBitbucketByUserId(req.userId)
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
}, (req, res) => {
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
        console.log('success update refresh_token');
        const url = `${config.parseServerHost}` +
          `access_token=${req.accessToken}&` +
            `acountname=${req.acountname}&` +
              `slug=${req.slug}&` +
                `branch=${req.branch}&` +
                  `tasks=${JSON.stringify([])}`;

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
        let arr = [];
        tasks.forEach(task => {
          console.log('userId' + req.userId);
          let curTask = {...task, userId: req.userId};
          console.log(curTask);
          arr.push(addNewTask(req.projectId, curTask));
        });
        Promise.all(arr)
          .then(
            success => {
              res.send({
                id: req.projectId,
                title: req.projectTitle
              });
            },
            err => {
              console.log(err);
              res.status(500).send({err: err});
            }
          )
      },
      err => {
        console.log(err);
        res.status(500).send({err: err});
      }
    )
});

router.get('/getAll', (req, res) => {
  bd.getProjects(req.query.userId)
    .then(
      value => {
        console.log(value);
        res.send({projects: value})
      },
      err => {
        console.log(err);
        res.status(500).send({err: err})
      }
    )
});

router.get('/delete', (req, res) => {
  bd.deleteProject(req.query.userId, req.query.projectId)
    .then(
      value => {
        console.log(value);
        res.send({success: 'success'});
      },
      err => {
        console.log(err);
        res.status(500).send({err: err});
      }
    )
});

module.exports = router;
