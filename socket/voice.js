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

    // socket.on('call-user', data => {
    //     const user = userSockets.get(data.userToCall);
    //     if (user) {
    //         io.to(user).emit('calling', {
    //             from: data.from,
    //             signalData: data.signalData
    //         })
    //     }
    // })
    //
    // socket.on('acceptCall', data => {
    //     const user = userSockets.get(data.to);
    //     if (user) {
    //         io.to(user).emit('callAccepted', data.signalData)
    //     }
    // })
}