const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const userSession = require('./sessions/UserSession');
const apiRouter =require('./routers/api/apiRouter');
const staticRouter = require('./routers/static/staticRouter');
const cors = require('cors');

const PORT = process.env.PORT || 80;
const app = express();
const expressWs = require('express-ws')(app);

app.set('trust proxy', 1);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({credentials: true, origin: '*'}));

app.use(express.static(path.join(__dirname, '../static/public/dist')));
app.use(userSession.getSession());

app.use('/api', apiRouter);

//for reloading page
app.use('/auth/sign-in', staticRouter);
app.use('/auth/sign-up', staticRouter);
app.use('/cabinet', staticRouter);
app.use('/cabinet/user', staticRouter);
app.use('/cabinet/projects', staticRouter);

app.listen(PORT, () =>
console.log('Express app listening on localhost: ' + PORT));
