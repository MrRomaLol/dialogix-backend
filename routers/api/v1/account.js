const crypto = require("crypto");
const passport = require("passport");
const LocalStrategy = require('passport-local');

const db = require("../../../database/db")

passport.use(new LocalStrategy(function verify(username, password, done) {
    if (username.includes(' ')) return done(null, false, {message: 'Incorrect username or password.'});

    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], function (err, row) {
        if (err) return done(err);
        if (!row) return done(null, false, {message: 'Incorrect username or password.'});

        crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
            if (err) return done(err);
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword))
                return done(null, false, {message: 'Incorrect username or password.'});
            return done(null, row);
        });
    });
}));

passport.serializeUser(function (user, done) {
    done(null, {id: user.id, username: user.username});
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

const register = (req, res, next) => {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function (err, hashedPasswd) {
        if (err) {
            res.json({status: 'error', message: err.message});
            return next(err);
        }

        db.run("INSERT INTO users (username, email, hashed_password, salt) VALUES (?, ?, ?, ?)", [
            req.body.username,
            req.body.email,
            hashedPasswd,
            salt
        ], function (err) {
            if (err) {
                res.json({status: 'error', message: err.message});
                return next(err);
            }
            const user = {
                id: this.lastID,
                username: req.body.username
            };
            req.login(user, function (err) {
                if (err) {
                    res.json({status: 'error', message: err.message});
                    return next(err);
                }
                res.json({status: 'success', message: ''});
            })
        })
    })
}

const login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            res.json({status: 'error', message: err.message});
            return next(err);
        }
        if (!user) {
            return res.json({status: 'notauser', message: 'user not found'});
        }

        if (req.body.remember) {
            req.session.cookie.maxAge = 2592000000; // 30 days
        } else {
            req.session.cookie.expires = false;
        }

        req.login(user, (err) => {
            if (err) {
                res.json({status: 'error', message: err.message});
                return next(err);
            }
            return res.json({status: 'success', message: ''});
        });
    })(req, res, next);
}

const logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        res.json({status: 'success', message: ''});
    })
}

// const loginStatus = (req, res) => {
//     if (!req.isAuthenticated()) {
//         return res.json({
//             status: 'notloggedin'
//         });
//     }
//     res.json({
//         status: 'loggedin'
//     })
// }

module.exports = {register, login, logout}
