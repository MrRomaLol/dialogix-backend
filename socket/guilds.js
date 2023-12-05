const serverEmitter = require("../events");
const {userSockets, getIo} = require("./index");
const db = require("../database/db");

const getGuildsByUserIdQuery = `
SELECT g.id  
FROM guilds g
INNER JOIN guild_members gm 
ON g.id = gm.guild_id 
WHERE gm.user_id = ?;
`

module.exports = function (socket, io) {
   socket.on('change-status', () => {
      const id = socket.userId;

      db.all(getGuildsByUserIdQuery, [id], (err, guilds) => {
         guilds.forEach(guild => {
            io.to(`g-${guild.id}`).emit('guild-updates', {guildId: guild.id, eventType: "userStatusUpdate"});
         })
      })
   })

   socket.on('disconnect', () => {
      const id = socket.userId;

      if (userSockets.get(id) === socket.id) {
         db.all(getGuildsByUserIdQuery, [id], (err, guilds) => {
            guilds.forEach(guild => {
               io.to(`g-${guild.id}`).emit('guild-updates', {guildId: guild.id, eventType: "userStatusUpdate"});
            })
         })
      }
   })
}

serverEmitter.on('guild-updates', (args) => {
   getIo().to(`g-${args.guildId}`).emit('guild-updates', args);
})