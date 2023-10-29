const crypto = require("crypto");
const passport = require("passport");
const LocalStrategy = require('passport-local');

const db = require("../../../database/db");

const getUserInformationQuery = `
SELECT a.id, a.username, u.nickname, u.avatar_url, u.status
FROM users u 
INNER JOIN accounts a 
ON a.id = u.user_id
WHERE a.id = ?;
`

passport.use(new LocalStrategy(function verify(username, password, done) {
    if (username.includes(' ')) return done(null, false, {message: 'Incorrect username or password.'});

    db.get('SELECT * FROM accounts WHERE username = ? OR email = ?', [username, username], function (err, row) {
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
            res.json({ok: false, status: 'error', message: err.message});
            return next(err);
        }

        db.run("INSERT INTO accounts (username, email, hashed_password, salt) VALUES (?, ?, ?, ?)", [
            req.body.username,
            req.body.email,
            hashedPasswd,
            salt
        ], function (err) {
            db.run("INSERT INTO users (user_id, nickname) VALUES (?, ?)", [this.lastID, req.body.username]);

            if (err) {
                res.json({ok: false, status: 'error', message: err.message});
                return next(err);
            }
            const lastId = this.lastID;
            const user = {
                id: lastId,
                username: req.body.username
            };
            req.login(user, function (err) {
                if (err) {
                    res.json({ok: false, status: 'error', message: err.message});
                    return next(err);
                }
                db.get(getUserInformationQuery, [lastId], (err, row) => {
                    if (err) {
                        res.json({ok: false, status: 'error', message: err.message});
                        return next(err);
                    }
                    res.json({ok: true, userInfo: row});
                })
            })
        })
    })
}

const login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            res.json({ok: false, status: 'error', message: err.message});
            return next(err);
        }

        if (!user) {
            return res.json({ok: false, status: 'notauser', message: 'user not found'});
        }

        if (req.body.rememberMe) {
            req.session.cookie.maxAge = 2592000000; // 30 days
        } else {
            req.session.cookie.expires = false;
        }

        req.login(user, (err) => {
            if (err) {
                res.json({ok: false, status: 'error', message: err.message});
                return next(err);
            }

            db.get(getUserInformationQuery, [user.id], (err, row) => {
                if (err) {
                    res.json({ok: false, status: 'error', message: err.message});
                    return next(err);
                }
                res.json({ok: true, userInfo: row});
            })
        });
    })(req, res, next);
}

const logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        return res.json({ok: true, status: 'success', message: ''});
    })
}

const loginStatus = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({
            ok: false
        });
    }
    db.get(getUserInformationQuery, [req.user.id], (err, row) => {
        if (err) {
            res.json({ok: false, status: 'error', message: err.message});
            return next(err);
        }
        res.json({ok: true, userInfo: row});
    })
}

module.exports = {register, login, logout, loginStatus}
