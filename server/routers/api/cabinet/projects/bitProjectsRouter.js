const express = require('express');
const bd = require('../../../../bd/DataBase');
const config = require('../../sign/bitbucket/config');
const FormData = require('form-data');
const fetch = require('node-fetch');

const router = express.Router();

router.get('/', (req, res, next) => {
  console.log('here' + req.query.id)
  console.log(req.query.id);
  bd.getBitbucketByUserId(req.query.id)
    .then(
      data => {
        console.log(data);
        if (data !== undefined) {
          console.log('normal user')
          req.bitbucket = data.bitbucket;
          req.refreshToken = data.refresh_token;
          next();
        } else {
          console.log('not found')
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
        const url = ` https://api.bitbucket.org/1.0/user/repositories?` +
          `access_token=${req.accessToken}`;

        return fetch(url);
      },
      err => {
        console.log(err);
        res.status(500).send({err: err});
      }
    )
    .then(
      ans => ans.json(),
      err => {
        console.log(err);
        res.status(500).send({err: err})
      }
    )
    .then(
      reps => {
        //console.log(reps);
        reps = reps.map((rep) => {
          return {
            accountname: rep.owner,
            slug: rep.slug
          }
        });
        console.log(reps);
        res.send(reps);
      }
    )

});

router.get('/getbranches', (req, res, next) => {
  console.log(req.query.id);
  bd.getBitbucketByUserId(req.query.id)
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
        const url = ` https://api.bitbucket.org/1.0/repositories/${req.query.acountname}/${req.query.slug}/branches?` +
          `access_token=${req.accessToken}`;

        return fetch(url);
      },
      err => {
        console.log(err);
        res.status(500).send({err: err});
      }
    )
    .then(
      ans => ans.json(),
      err => {
        console.log(err);
        res.status(500).send({err: err})
      }
    )
    .then(
      data => {
        console.log(data);
        branches = Object.keys(data);
        console.log(branches);
        res.send(branches);
      }
    )

});

module.exports = router;
