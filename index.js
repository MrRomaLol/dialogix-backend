const {readFileSync} = require("fs");
const express = require('express');
const cookieParser = require('cookie-parser');
const router = require('./routers/routers');
const session = require("express-session");
const passport = require("passport");
const SQLiteStore = require('connect-sqlite3')(session);
const logger = require('morgan');
const {createServer: createServerHttp} = require('http');
const {createServer: createServerHttps} = require('https');
const {initializeSocketIO} = require("./socket");

const privateKey = readFileSync('sslcert/private-key.pem', 'utf8');
const certificate = readFileSync('sslcert/certificate.pem', 'utf8');

const credentials = {key: privateKey, cert: certificate};

const PORT_HTTP = 8080;
const PORT_HTTPS = 8081;

const app = express();
const serverHttp = createServerHttp(app);
const serverHttps = createServerHttps(credentials, app);

initializeSocketIO(serverHttp);

app.use(express.static('public'));

app.use(logger('dev'))
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    store: new SQLiteStore({dir: './database/', db: 'sessions.db'}),
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', router);

serverHttp.listen(PORT_HTTP, () => {
    console.log(`HTTP server started on port: ${PORT_HTTP}`);
});

serverHttps.listen(PORT_HTTPS, () => {
    console.log(`HTTPS server started on port: ${PORT_HTTPS}`);
});