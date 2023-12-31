const serverEmitter = require("../events");
const db = require("../database/db");
const {userSockets, getIo} = require("./index");

const getFriendsStatusQuery = `
SELECT DISTINCT 
    CASE 
        WHEN f1.user_id1 = ? THEN f1.user_id2 
        WHEN f2.user_id2 = ? THEN f2.user_id1 
    END as id
FROM friends f1 
LEFT JOIN friends f2 ON f1.id = f2.id
WHERE (f1.user_id1 = ? AND f1.status IN ('friends', 'pending')) 
   OR (f2.user_id2 = ? AND f2.status IN ('friends', 'pending'));
`

const updateStatusInDbQuery = `
UPDATE users
SET status = ?
WHERE id = ?;
`

module.exports = function (socket, io) {
    socket.on('change-status', (status, cb) => {
        const id = socket.userId;
        db.all(getFriendsStatusQuery, Array(4).fill(id), (err, rows) => {
            rows.forEach(row => {
                const userSocket = userSockets.get(row.id);
                if (userSocket) {
                    io.to(userSocket).emit('user-status-update', {id, status});
                }
            })
            cb(status);
            db.run(updateStatusInDbQuery, [status, id]);
        })
    })

    socket.on('disconnect', () => {
        const id = socket.userId;

        if (userSockets.get(id) === socket.id) {
            db.all(getFriendsStatusQuery, Array(4).fill(id), (err, rows) => {
                rows.forEach(row => {
                    const userSocket = userSockets.get(row.id);
                    if (userSocket) {
                        io.to(userSocket).emit('user-status-update', {id, status: "offline"});
                    }
                })
                db.run(updateStatusInDbQuery, ["offline", id]);
            })
        }
    })
}

serverEmitter.on('profile-update', ({profileInfo, id}) => {
    db.all(getFriendsStatusQuery, Array(4).fill(id), (err, rows) => {
        rows.forEach(row => {
            const userSocket = userSockets.get(row.id);
            if (userSocket) {
                const data = {
                    id,
                    profileInfo
                }
                getIo().to(userSocket).emit('profile-update', data);
            }
        })
    })
})