const {Server} = require('socket.io');

const userSockets = new Map();

let io;

function initializeSocketIO(server) {
    io = new Server(server);
    io.on('connection', (socket) => {

        socket.on('my-id', (id) => {
            userSockets.set(id, socket.id);
            socket.userId = id;
        })

        socket.on('disconnect', () => {
            const userId = socket.userId;
            if (userSockets.get(userId) === socket.id) {
                userSockets.delete(userId);
            }
        })
    });
}

module.exports = {
    initializeSocketIO,
    getIo: () => io,
    userSockets
}