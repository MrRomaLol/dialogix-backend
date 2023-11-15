const db = require("../../../../database/db");
const {writeImageFromBuffer} = require("../../../../utils/fs");
const {getRandomName} = require("../../../../utils/utils");

const getGuildByUserIdQuery = `
SELECT g.id, g.creator_id as creatorId, g.name, g.avatar_url as avatarUrl  
FROM guilds g
INNER JOIN guild_members gm 
ON g.id = gm.guild_id 
WHERE gm.user_id = ?;
`

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

const addMemberQuery = `
INSERT INTO [guild_members] (user_id, guild_id, [role]) 
VALUES (?, ?, ?)
`

const getGuilds = (req, res) => {
    const myId = req.user.id;

    db.all(getGuildByUserIdQuery, [myId], function (err, rows) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        return res.json({ok: true, guilds: rows});
    })
}

const createGuild = (req, res) => {
    const myId = req.user.id;

    db.run(createGuildQuery, [myId, req.body.guildName], function (err, result) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        const guildId = result.lastID;

        db.run(addMemberQuery, [myId, guildId, 'admin'], function (err) {
            const sendGuildInfo = () => {
                if (err) {
                    console.log(err);
                    return res.json({ok: false, status: 'error', message: err.message});
                }

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
    })
}

module.exports = {getGuilds, createGuild}