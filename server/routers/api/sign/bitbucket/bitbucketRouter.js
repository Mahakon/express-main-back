const fetch = require('node-fetch');
const express = require('express');
const bd = require('../../../../bd/DataBase');
const path = require('path');
const config =require('./config');
const FormData = require('form-data');

const router = express.Router();

router.get('/', (req, res, next) => {
  console.log(req.query.code);

  const url = `https://bitbucket.org/site/oauth2/access_token`;
  let form = new FormData();

  form.append('client_id', config.key);
  form.append('client_secret', config.secret);
  form.append('grant_type', 'authorization_code');
  form.append('code', req.query.code);

  const options = {
    method: 'POST',
    body: form
  };

  fetch(url, options)
    .then(ans => ans.json())
    .then(data => {
      console.log(data);
      const url = `https://api.bitbucket.org/1.0/user?` +
                   `access_token=${data.access_token}`;
      req.refreshToken = data.refresh_token;

      return fetch(url);
    })
    .then(
      ans => ans.json(),
      err => {
        console.log(err);
        next();
      }
    )
    .then(
      data => {
        console.log(data);
        req.userName = data.user.username;
        next('route');
      }
    )
}, function (req, res, next) {
  res.redirect(config.host);
  res.end();
});

const newBitbucketUser = function (req, res, next) {
  if (req.session.user_id === undefined) {
    bd.getUserIdByBitbucket(req.userName)
      .then(
        id => {
          if (id === undefined) {
            next();
          }

          return bd.addBitbucketUser(req.userName, req.userName, req.refreshToken);
        },
        err => {
          console.log(err);
          next();
        }
      )
      .then(
        id => {
          req.session.user_id = id;
          next();
        },
        err => {
          console.log(err);
          next();
        }
      )
  } else {
    bd.addBitbucketToCurAcount(
      req.session.user_id,
      req.userName,
      req.refreshToken
    )
      .then(
        success => {
          next();
        },
        err => {
          console.log(err);
          next();
        }
      )
  }
};

router.use(newBitbucketUser, (req, res, next) => {
  res.redirect(config.host);
  res.end();
});

module.exports = router;
