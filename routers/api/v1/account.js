const crypto = require("crypto");
const passport = require("passport");
const LocalStrategy = require('passport-local');

const db = require("../../../database/db");

const getUserInformationQuery = `
SELECT a.id, a.username, a.email, u.nickname, u.avatar_url, u.status
FROM users u 
INNER JOIN accounts a 
ON a.id = u.user_id
WHERE a.id = ?;
`

const updatePasswordQuery = `
UPDATE accounts
SET hashed_password = ?,
    salt = ?
WHERE
    id = ?
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
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        db.run("INSERT INTO accounts (username, email, hashed_password, salt) VALUES (?, ?, ?, ?)", [
            req.body.username,
            req.body.email,
            hashedPasswd,
            salt
        ], function (err, result) {
            db.run("INSERT INTO users (user_id, nickname) VALUES (?, ?)", [result.lastID, req.body.username]);

            if (err) {
                res.json({ok: false, status: 'error', message: err.message});
                return next(err);
            }
            const lastId = result.lastID;
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
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
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

const logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }
        return res.json({ok: true});
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
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }
        return res.json({ok: true, userInfo: row});
    })
}

const changePassword = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            ok: false,
            status: 'unauthorized'
        })
    }

    const myId = req.user.id;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    db.get('SELECT * FROM accounts WHERE [id] = ?', [myId], function (err, row) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        crypto.pbkdf2(currentPassword, row.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
            if (err) {
                console.log(err);
                return res.json({ok: false, status: 'error', message: err.message});
            }

            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
                return res.json({ok: false, status: 'wrong_password'});
            }

            const newSalt = crypto.randomBytes(16);
            crypto.pbkdf2(newPassword, newSalt, 310000, 32, 'sha256', function (err, hashedPasswd) {
                if (err) {
                    console.log(err);
                    return res.json({ok: false, status: 'error', message: err.message});
                }

                db.run(updatePasswordQuery, [hashedPasswd, newSalt, myId], function (err) {
                    if (err) {
                        console.log(err);
                        return res.json({ok: false, status: 'error', message: err.message});
                    }

                    return res.json({ok: true});
                })
            })
        });
    });
}

module.exports = {register, login, logout, loginStatus, changePassword}


