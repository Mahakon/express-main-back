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
          return fetch(`https://api.vk.com/method/users.get?` +
            `user_id=${vkUserId}&` +
            `access_token=${accessToken}&v=5.52`)
        }

        req.session.user_id = id;
        res.redirect(config.host);
      },
      err => {
        console.log(err);
        res.redirect(config.host);
      }
    )
    .then(ans => ans.json())
    .then(data => {
      return bd.addVkUser(data.response[0].first_name +" " + data.response[0].last_name, data.response[0].id)
    })
    .then(
      id => {
        req.session.user_id = id;
        res.redirect(config.host);
      },
      err => {
        console.log(err);
        res.redirect(config.host);
      }
    );
});

module.exports = router;
