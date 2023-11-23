const {userSockets} = require("./index");

module.exports = function (socket, io) {
    socket.on('private-call-user', ({userToCall, signalData}) => {
        const id = socket.userId;
        const user = userSockets.get(userToCall);
        if (user) {
            io.to(user).emit('private-calling', {id, signal: signalData});
        }
    })

    socket.on('accept-private-call', ({signal, to}) => {
        const user = userSockets.get(to);
        if (user) {
            io.to(user).emit('private-call-accepted', signal);
        }
    })

    socket.on('cancel-private-call', (to) => {
        const user = userSockets.get(to);
        if (user) {
            io.to(user).emit('private-call-canceled');
        }
    })

    socket.on('end-private-call', (to) => {
        console.log(to);
        const user = userSockets.get(to);
        if (user) {
            io.to(user).emit('private-call-ended');
        }
    })
}