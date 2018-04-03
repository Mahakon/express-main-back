const fetch = require('node-fetch');
const express = require('express');
const bd = require('../../../../bd/DataBase');

const router = express.Router();

router.get('/', (req, res) => {
  console.log(req.query.code);
  const url = `https://oauth.vk.com/access_token?client_id=6435400&client_secret=XkucfGvxCssfWm9IbUAJ&redirect_uri=https://c4fdc676.ngrok.io/api/auth/vk&code=${req.query.code}`;
  console.log(url);
  fetch(url)
    .then(res => res.json())
    .then(data => fetch(`https://api.vk.com/method/users.get?user_id=${data.user_id}&access_token=${data.access_token}&v=5.52`))
    .then(res => res.json())
    .then(data => console.log(data));
  res.redirect('/');
  res.end()
});

module.exports = router;
