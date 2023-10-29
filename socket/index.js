const {Server} = require('socket.io');

const userSockets = {};

let io;

function initializeSocketIO(server) {
    io = new Server(server);
    io.on('connection', (socket) => {
        console.log('connected', socket.id);

        socket.on('my-id', (id) => {
            userSockets[id] = socket.id;
        })

        socket.on('disconnect', () => {
            for (const id in userSockets) {
                if (userSockets[id] === socket.id) {
                    delete userSockets[id];
                }
            }
        })
    });
}

module.exports = {
    initializeSocketIO,
    io: () => {
        if (!io) {
            throw new Error('Socket.IO has not been initialized.');
        }
        return io;
    }, userSockets
}