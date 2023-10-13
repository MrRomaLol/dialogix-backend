const db = require("../../../../database/db")

const isUserAlreadyAddedQuery = `
SELECT * 
FROM friends 
WHERE (user_id1 = ? AND user_id2 = ?)
OR (user_id1 = ? AND user_id2 = ?);
`

const sendFriendRequestAgain = `
UPDATE friends
SET status = 'pending'
WHERE user_id1 = ? AND user_id2 = ?;
`

const getPendingFriendsAccounts = `
SELECT u.user_id as id, u.nickname, u.avatar_url, u.status
FROM users u 
JOIN friends f ON u.id = f.user_id1
WHERE f.user_id2 = ? AND f.status = 'pending';
`

const getSentFriendsAccounts = `
SELECT u.user_id as id, u.nickname, u.avatar_url, u.status
FROM users u 
JOIN friends f ON u.id = f.user_id2
WHERE f.user_id1 = ? AND f.status = 'pending';
`

const getFriendsAccounts = `
SELECT u.user_id as id, u.nickname, u.avatar_url, u.status
FROM users u 
JOIN friends f1 ON u.id = f1.user_id1
JOIN friends f2 ON u.id = f2.user_id2
WHERE (f1.user_id2 = ? AND f1.status = 'friends') OR (f2.user_id1 = ? AND f2.status = 'friends')
`

const acceptRequestQuery = `
UPDATE friends
SET status = 'friends'
WHERE user_id1 = ? AND user_id2 = ?;
`

const rejectRequestQuery = `
UPDATE friends
SET status = 'denied'
WHERE user_id1 = ? AND user_id2 = ?;
`

const unSendRequestQuery = `
DELETE FROM friends
WHERE user_id1 = ? AND user_id2 = ?;
`


const getFriends = (req, res) => {
    const myId = req.user.id;

    db.all(getFriendsAccounts, [myId, myId], function (err, rows) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        return res.json({
            ok: true,
            friends: rows
        })
    })
}

const sendRequest = (req, res) => {
    const friendName = req.body.nick;

    if (req.user.username === friendName) {
        return res.json({
            ok: false,
            status: 'seldadd',
            message: 'Cannot add self'
        })
    }

    db.get('SELECT * FROM accounts WHERE username = ?', [friendName], function (err, row) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        if (!row) {
            return res.json({ok: false, status: 'usernotfound', message: 'User not found'});
        }

        db.get(isUserAlreadyAddedQuery, [req.user.id, row.id, row.id, req.user.id], function (err, row1) {
            if (err) {
                console.log(err);
                return res.json({ok: false, status: 'error', message: err.message});
            }

            if (!row1) {
                db.run('INSERT INTO friends (user_id1, user_id2) values (?, ?)', [req.user.id, row.id], function (err) {
                    if (err) {
                        console.log(err);
                        return res.json({ok: false, status: 'error', message: err.message});
                    }

                    return res.json({
                        ok: true
                    })
                })
            }

            if (row1.status === 'rejected') {
                db.run(sendFriendRequestAgain, [req.user.id, row.id], function (err) {
                    if (err) {
                        console.log(err);
                        return res.json({ok: false, status: 'error', message: err.message});
                    }

                    return res.json({
                        ok: true
                    })
                })
            }
            return res.json({ok: false, status: 'alreadyadded', message: 'Users already added'});
        })
    })
}

const unSendRequest = (req, res) => {
    const myId = req.user.id;
    const userId = req.body.userId;

    db.run(unSendRequestQuery, [myId, userId], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        return res.json({
            ok: true,
        })
    })
}

const getSent = (req, res) => {
    const myId = req.user.id;

    db.all(getSentFriendsAccounts, [myId], function (err, rows) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        return res.json({
            ok: true,
            friends: rows
        })
    })
}

const getPending = (req, res) => {
    const myId = req.user.id;

    db.all(getPendingFriendsAccounts, [myId], function (err, rows) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        return res.json({
            ok: true,
            friends: rows
        })
    })
}

const acceptRequest = (req, res) => {
    const myId = req.user.id;
    const userId = req.body.userId;

    db.run(acceptRequestQuery, [userId, myId], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        return res.json({
            ok: true,
        })
    })
}

const rejectRequest = (req, res) => {
    const myId = req.user.id;
    const userId = req.body.userId;

    db.run(rejectRequestQuery, [userId, myId], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        return res.json({
            ok: true,
        })
    })
}


module.exports = {sendRequest, getPending, getFriends, acceptRequest, rejectRequest, getSent, unSendRequest}