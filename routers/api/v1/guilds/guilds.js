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

const getChannelsCategoryByGuildIdQuery = `
SELECT * FROM guild_channels_category
WHERE guild_id = ?;
`

const getChannelsByGuildIdQuery = `
SELECT * FROM guild_channels
WHERE guild_id = ?;
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

const createCategoryQuery = `
INSERT INTO guild_channels_category (guild_id, name)
SELECT DISTINCT ?, ?
FROM guilds
WHERE creator_id = ?;
`

const deleteCategoryQuery = `
DELETE FROM guild_channels_category
WHERE id = ? AND guild_id = ?
AND EXISTS (
    SELECT 1
    FROM guilds
    WHERE creator_id = ?
);
`

const deleteChannelsByCategoryIdQuery = `
DELETE FROM guild_channels
WHERE category_id = ? AND guild_id = ?
AND EXISTS (
    SELECT 1
    FROM guilds
    WHERE creator_id = ?
);
`

const createChannelQuery = `
INSERT INTO guild_channels (guild_id, category_id, name, channel_type)
SELECT DISTINCT ?, ?, ?, ?
FROM guilds
WHERE creator_id = ?;
`

const deleteChannelQuery = `
DELETE FROM guild_channels
WHERE id = ? AND guild_id = ?
AND EXISTS (
    SELECT 1
    FROM guilds
    WHERE creator_id = ?
);
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

const loadGuild = (req, res) => {
    const myId = req.user.id;
    const guildId = req.query.guildId;

    db.all(getChannelsCategoryByGuildIdQuery, [guildId], function (err, channelsCategoryRows) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        db.all(getChannelsByGuildIdQuery, [guildId], function (err, channelsRows) {
            if (err) {
                console.log(err);
                return res.json({ok: false, status: 'error', message: err.message});
            }

            //TODO: users

            return res.json({ok: true, categories: channelsCategoryRows, channels: channelsRows});
        })
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

const createCategory = (req, res) => {
    const myId = req.user.id;
    const guildId = req.body.guildId;
    const categoryName = req.body.categoryName;

    db.run(createCategoryQuery, [guildId, categoryName, myId], function (err, result) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        const category = {id: result.lastID, guild_id: guildId, name: categoryName};
        return res.json({ok: true, category});
    })
}

const deleteCategory = (req, res) => {
    const myId = req.user.id;
    const guildId = req.body.guildId;
    const categoryId = req.body.categoryId;

    db.run(deleteCategoryQuery, [categoryId, guildId, myId], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        db.run(deleteChannelsByCategoryIdQuery, [categoryId, guildId, myId], function (err) {
            if (err) {
                console.log(err);
                return res.json({ok: false, status: 'error', message: err.message});
            }

            return res.json({ok: true});
        })
    })
}

const createChannel = (req, res) => {
    const myId = req.user.id;
    const guildId = req.body.guildId;
    const categoryId = req.body.categoryId;
    const channelName = req.body.channelName;
    const channelType = req.body.channelType;

    db.run(createChannelQuery, [guildId, categoryId, channelName, channelType, myId], function (err, result) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        const channel = {
            id: result.lastID,
            guild_id: guildId,
            category_id: categoryId,
            name: channelName,
            channel_type: channelType
        };
        return res.json({ok: true, channel});
    })
}

const deleteChannel = (req, res) => {
    const myId = req.user.id;
    const guildId = req.body.guildId;
    const channelId = req.body.channelId;

    db.run(deleteChannelQuery, [channelId, guildId, myId], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        return res.json({ok: true});
    })
}

module.exports = {getGuilds, loadGuild, createGuild, createCategory, deleteCategory, createChannel, deleteChannel}