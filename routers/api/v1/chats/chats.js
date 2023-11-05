const serverEmitter = require('../../../../events')
const db = require("../../../../database/db")

const getMessagesQuery = `
SELECT id, sender_id, receiver_id, content, time_stamp
FROM messages
WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
ORDER BY time_stamp DESC
LIMIT 20
OFFSET ?;
`

const writeMessageQuery = `
INSERT INTO [messages] (sender_id, receiver_id, content)
VALUES (?, ?, ?);
`

const getMessageById = `
SELECT * FROM [messages] WHERE id = ?;
`

const getMessages = (req, res) => {
    const myId = req.user.id;
    const chatId = req.query.chatId;
    const offset = req.query.offset;

    db.all(getMessagesQuery, [myId, chatId, chatId, myId, offset], (err, rows) => {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        return res.json({
            ok: true,
            messages: rows.reverse()
        });
    })
}

const sendMessage = (req, res) => {
    const myId = req.user.id;
    const receiverId = req.body.receiverId;
    const content = req.body.content;

    db.run(writeMessageQuery, [myId, receiverId, content], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        db.get(getMessageById, [this.lastID], (err, row) => {
            if (err) {
                console.log(err);
                return res.json({ok: false, status: 'error', message: err.message});
            }

            serverEmitter.emit('message-send', row);

            return res.json({
                ok: true,
                message: row
            });
        })
    })
}

module.exports = {getMessages, sendMessage}