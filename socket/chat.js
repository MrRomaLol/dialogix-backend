const {userSockets, getIo} = require("./index");
const serverEmitter = require("../events");

module.exports = function (socket, io) {
    socket.on('private-message-typing-ping', (userId) => {
        const senderId = socket.userId;
        const user = userSockets.get(userId);
        if (user) {
            io.to(user).emit('private-message-typing', senderId);
        }
    })
}

serverEmitter.on('message-send', (message) => {
    const userSocket = userSockets.get(message.receiver_id);
    if (userSocket) {
        getIo().to(userSocket).emit('new-private-message', message);
    }
});