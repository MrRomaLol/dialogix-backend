const {userSockets} = require("./index");

module.exports = function (socket, io) {
    socket.on('call-user', data => {
        const user = userSockets.get(data.userToCall);
        if (user) {
            io.to(user).emit('calling', {
                from: data.from,
                signalData: data.signalData
            })
        }
    })

    socket.on('acceptCall', data => {
        const user = userSockets.get(data.to);
        if (user) {
            io.to(user).emit('callAccepted', data.signalData)
        }
    })
}