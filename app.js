const express = require('express')
const app = express();
const PORT = 1337;
const allowedOrigin = 'http://localhost:8080';
const cors = require('cors');
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser');
const router = require('./router');
const cookieParser = require('cookie-parser');

app.use(cors({origin: allowedOrigin, credentials: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['hello', 'world'],
  maxAge: 24 * 60 * 60 * 1000,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', router);

app.listen(PORT, "0.0.0.0", function() {
    console.log(`Running on port ${PORT}`);
});