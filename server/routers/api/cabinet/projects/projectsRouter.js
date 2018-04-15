const express = require('express');
const multer  = require('multer');
const bd = require('../../../../bd/DataBase');

const upload = multer();
const router = express.Router();

router.post('/add', upload.fields([]), (req, res) => {
  const project = req.body;

  bd.addProject(project.userId, project.title)
    .then(
      id => res.send(
        {
          id: id,
          title: project.title
        }
        ),
      err => {
        console.log(err);
        res.status(500).send(err);
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

module.exports = router;
