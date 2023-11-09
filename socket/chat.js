const {userSockets} = require("./index");

module.exports = function (socket, io) {
    socket.on('private-message-typing-ping', (userId) => {
        const senderId = socket.userId;
        const user = userSockets.get(userId);
        if (user) {
            io.to(user).emit('private-message-typing', senderId);
        }
    })
}