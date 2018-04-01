const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const userSession = require('./sessions/UserSession');
const apiRouter =require('./routers/api/apiRouter');
const staticRouter = require('./routers/static/staticRouter');

const PORT = process.env.PORT || 8080;
const app = express();

app.set('trust proxy', 1);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../static/public/dist')));
app.use(userSession.getSession());

app.use('/api', apiRouter);

//for reloading page
app.use('/sign-in', staticRouter);
app.use('/sign-up', staticRouter);
app.use('/user/:id', staticRouter);

app.listen(PORT, () =>
console.log('Express app listening on localhost: ' + PORT));
