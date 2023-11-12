const {Server} = require('socket.io');

const serverEmitter = require('../events')

const userSockets = new Map();

let io;

function initializeSocketIO(server) {
    io = new Server(server);
    io.on('connection', (socket) => {
        socket.on('my-id', (id) => {
            const user = userSockets.get(id);
            if (user && user !== socket.id) {
                io.to(user).emit('connect-from-another-place');
            }
            userSockets.set(id, socket.id);
            socket.userId = id;
        })

        socket.on('disconnect', () => {
            const userId = socket.userId;
            if (userSockets.get(userId) === socket.id) {
                userSockets.delete(userId);
            }
        })

        require('./voice')(socket, io);
        require('./chat')(socket, io);
    });


}

serverEmitter.on('message-send', (message) => {
    const userSocket = userSockets.get(message.receiver_id);
    if (userSocket) {
        io.to(userSocket).emit('new-private-message', message);
    }
});

module.exports = {
    initializeSocketIO,
    getIo: () => io,
    userSockets
}