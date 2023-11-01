const db = require("../../../../database/db")
const {userSockets, getIo} = require("../../../../socket");

const requestFriendQuery = `
INSERT INTO friends (user_id1, user_id2, status)
SELECT ?, accounts.id, 'pending'
FROM accounts
WHERE accounts.username = ?
AND accounts.id <> ?
AND NOT EXISTS (
    SELECT 1
    FROM friends
    WHERE ((user_id1 = ? AND user_id2 = accounts.id) OR (user_id1 = accounts.id AND user_id2 = ?))
    AND status IN ('friends', 'pending')
);
`
const getUserByUsernameQuery = `
SELECT u.id, u.nickname, u.avatar_url, u.status
FROM users u
JOIN accounts a ON u.user_id = a.id
WHERE a.username = ?; 
`

const getUserByIdQuery = `
SELECT u.id, u.nickname, u.avatar_url, u.status
FROM users u
JOIN accounts a ON u.user_id = a.id
WHERE a.id = ?; 
`

const getFriendsStatusQuery = `
SELECT DISTINCT 
    CASE 
        WHEN f1.user_id1 = ? THEN f1.user_id2 
        WHEN f2.user_id2 = ? THEN f2.user_id1 
    END as id, 
    u.nickname, 
    u.avatar_url, 
    u.status, 
    CASE 
        WHEN f1.user_id1 = ? AND f1.status = 'friends' THEN 'friends'
        WHEN f2.user_id2 = ? AND f2.status = 'friends' THEN 'friends'
        WHEN f1.user_id1 = ? AND f1.status = 'pending' THEN 'sent'
        WHEN f2.user_id2 = ? AND f2.status = 'pending' THEN 'pending'
    END as friendsStatus
FROM users u 
LEFT JOIN friends f1 ON u.id = f1.user_id2 AND f1.user_id1 = ? 
LEFT JOIN friends f2 ON u.id = f2.user_id1 AND f2.user_id2 = ? 
WHERE (f1.user_id1 = ? AND f1.status IN ('friends', 'pending')) 
   OR (f2.user_id2 = ? AND f2.status IN ('friends', 'pending'));
`

const acceptRequestQuery = `
UPDATE friends
SET status = 'friends'
WHERE user_id1 = ? AND user_id2 = ?;
`

const unSendOrRejectRequestQuery = `
DELETE FROM friends
WHERE user_id1 = ? AND user_id2 = ?;
`

const deleteFromFriendsQuery = `
DELETE FROM friends
WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?);
`

const requestToUpdateFriendList = (id) => {
    const userSocket = userSockets.get(id);
    if (userSocket) {
        getIo().to(userSocket).emit('update-friend-list-request');
    }
}

const getFriends = (req, res) => {
    const myId = req.user.id;

    db.all(getFriendsStatusQuery, Array(10).fill(myId), function (err, rows) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        return res.json({
            ok: true,
            friends: rows
        });
    })
}

const sendRequest = (req, res) => {
    const myId = req.user.id;
    const friendName = req.body.nickname;

    db.run(requestFriendQuery, [myId, friendName, myId, myId], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        if (this.changes > 0) {
            db.get(getUserByUsernameQuery, [friendName], (err, friendRow) => {
                if (err) {
                    console.log(err);
                    return res.json({ok: false, status: 'error', message: err.message});
                }

                requestToUpdateFriendList(friendRow.id);

                return res.json({ok: true, friend: friendRow});
            })
        } else {
            return res.json({ok: false, status: 'nochange'});
        }
    })
}

const unSendRequest = (req, res) => {
    const myId = req.user.id;
    const userId = req.body.userId;

    db.run(unSendOrRejectRequestQuery, [myId, userId], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        requestToUpdateFriendList(userId);

        return res.json({
            ok: true,
            userId
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

        requestToUpdateFriendList(userId);

        return res.json({
            ok: true,
            userId
        })
    })
}

const rejectRequest = (req, res) => {
    const myId = req.user.id;
    const userId = req.body.userId;

    db.run(unSendOrRejectRequestQuery, [userId, myId], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        requestToUpdateFriendList(userId);

        return res.json({
            ok: true,
            userId
        })
    })
}

const deleteFriend = (req, res) => {
    const myId = req.user.id;
    const userId = req.body.userId;

    db.run(deleteFromFriendsQuery, [myId, userId, userId, myId], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        requestToUpdateFriendList(userId);

        return res.json({
            ok: true,
            userId
        })
    })
}


module.exports = {sendRequest, getFriends, acceptRequest, rejectRequest, unSendRequest, deleteFriend}