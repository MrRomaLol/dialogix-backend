const express = require('express');
const cookieParser = require('cookie-parser');
const router = require('./routers/routers');
const session = require("express-session");
const passport = require("passport");
const SQLiteStore = require('connect-sqlite3')(session);
const logger = require('morgan');
const cors = require("cors");

const PORT = 8080;

const app = express();

//TODO: remove on production
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
}));

app.use(logger('dev'))
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    secret: '',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    store: new SQLiteStore({dir: './database/', db: 'sessions.db'}),
    //TODO: remove on production
    proxy: true,
    cookie: {
        sameSite: 'none',
        secure: 'production',
    },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); //TODO: remove on production
    next();
});

app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});
