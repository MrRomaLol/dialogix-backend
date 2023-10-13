const express = require('express');
const cookieParser = require('cookie-parser');
const router = require('./routers/routers');
const session = require("express-session");
const passport = require("passport");
const SQLiteStore = require('connect-sqlite3')(session);
const logger = require('morgan');

const PORT = 8080;

const app = express();

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

app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});
