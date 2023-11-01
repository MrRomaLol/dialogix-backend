const db = require("../../../../database/db");
const {writeImageFromBuffer} = require("../../../../utils/fs");
const {getRandomName} = require("../../../../utils/utils");

const createGuildQuery = `
INSERT INTO [guilds] (creator_id, name)
VALUES (?, ?);
`

const updateAvatarQuery = `
UPDATE [guilds]
SET avatar_url = ?
WHERE id = ?;
`

const getGuildInfoById = `
SELECT id, creator_id as creatorId, name, avatar_url as avatarUrl, creator_id as creatorId 
FROM [guilds] where id = ?
`

const getGuilds = (req, res) => {

}

const createGuild = (req, res) => {
    const myId = req.user.id;

    db.run(createGuildQuery, [myId, req.body.guildName], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        const guildId = this.lastID;

        const sendGuildInfo = () => {
            db.get(getGuildInfoById, [guildId], (err, row) => {
                if (err) {
                    console.log(err);
                    return res.json({ok: false, status: 'error', message: err.message});
                }

                return res.json({ok: true, guild: row});
            })
        }

        const base64Avatar = req.body.avatar;
        if (base64Avatar) {
            const avatarName = `${getRandomName(20)}.jpg`;
            writeImageFromBuffer(`content/guilds/${guildId}/avatars/${avatarName}`, base64Avatar, () => {
                db.run(updateAvatarQuery, [avatarName, guildId], () => {
                    sendGuildInfo()
                });
            })
        } else {
            sendGuildInfo();
        }



    })
}

module.exports = {getGuilds, createGuild}