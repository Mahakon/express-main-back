const fetch = require('node-fetch');
const express = require('express');
const bd = require('../../../../bd/DataBase');
const path = require('path');
const config =require('./config');

const router = express.Router();

router.get('/', (req, res, next) => {
  let accessToken;
  let vkUserId;

  const url = `https://oauth.vk.com/access_token?` +
    `client_id=${config.clientId}&` +
    `client_secret=${config.secretKey}&` +
    `redirect_uri=${config.host}/api/auth/vk&` +
    `code=${req.query.code}`;

  fetch(url)
    .then(ans => ans.json())
    .then(data => {
      accessToken = data.access_token;
      vkUserId = data.user_id;
      return bd.getUserIdByVk(data.user_id)
    })
    .then(
      id => {
        if (id === undefined) {
          req.userData = {
            accessToken: accessToken,
            vkUserId: vkUserId
          };
          next('route')
        } else {
          req.session.user_id = id;
          next();
        }
      },
      err => {
        console.log(err);
        next();
      }
    )
}, function (req, res, next) {
  res.redirect(config.host);
  res.end();
});

const newVkUser = function (req, res, next) {
  const url = `https://api.vk.com/method/users.get?` +
              `user_id=${req.userData.vkUserId}&` +
              `access_token=${req.userData.accessToken}&v=5.52`;

  fetch(url)
    .then(
      ans => ans.json()
    )
    .then(
      data => bd.addVkUser(
                data.response[0].first_name +" " + data.response[0].last_name,
                data.response[0].id
      )
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
};

router.use(newVkUser, (req, res, next) => {
  res.redirect(config.host);
  res.end();
});

module.exports = router;
