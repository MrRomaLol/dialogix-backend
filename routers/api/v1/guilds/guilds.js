const db = require("../../../../database/db");
const {writeImageFromBuffer} = require("../../../../utils/fs");
const {getRandomName} = require("../../../../utils/utils");
const serverEmitter = require("../../../../events");

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

const getUsersByGuildIdQuery = `
SELECT
    gm.id AS guild_user_id,
    gm.user_id,
    gm.role,
    u.id AS user_id,
    u.nickname,
    u.avatar_url,
    u.status
FROM
    guild_members gm
JOIN
    users u ON gm.user_id = u.user_id
WHERE
    gm.guild_id = ?;
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
INSERT INTO guild_members (user_id, guild_id, role)
SELECT ?, ?, ?
WHERE NOT EXISTS (
    SELECT 1
    FROM guild_members
    WHERE user_id = ? AND guild_id = ?
);
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

const addInviteLinkQuery = `
INSERT INTO guild_invites (invite_link, guild_id, sender_id, invited_users)
VALUES (?, ?, ?, ?);
`

const getInviteLinkQuery = `
SELECT * FROM guild_invites
WHERE invite_link = ?;
`

const getGuildInfoQuery = `
SELECT id, name, avatar_url FROM guilds
WHERE id = ?;
`

const getUserInfoQuery = `
SELECT id, nickname, avatar_url FROM users
WHERE id = ?
`

const kickUserFromGuildQuery = `
DELETE FROM guild_members
WHERE id = ?
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

            db.all(getUsersByGuildIdQuery, [guildId], function (err, usersRows) {
                if (err) {
                    console.log(err);
                    return res.json({ok: false, status: 'error', message: err.message});
                }

                return res.json({ok: true, categories: channelsCategoryRows, channels: channelsRows, users: usersRows});
            })
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

        db.run(addMemberQuery, [myId, guildId, 'creator', myId, guildId], function (err) {
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

        serverEmitter.emit('guild-updates', {guildId, eventType: "createCategory"});

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

            serverEmitter.emit('guild-updates', {guildId, eventType: "deleteCategory"});

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

        serverEmitter.emit('guild-updates', {guildId, eventType: "createChannel"});

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

        serverEmitter.emit('guild-updates', {guildId, eventType: "deleteChannel"});

        return res.json({ok: true});
    })
}

const generateInviteLink = (req, res) => {
    const myId = req.user.id;
    const guildId = req.body.guildId;
    const invitedUsers = req.body.invitedUsers;

    const link = getRandomName(16);

    const invitedUsersJSON = JSON.stringify(invitedUsers);

    db.run(addInviteLinkQuery, [link, guildId, myId, invitedUsersJSON], function (err) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        return res.json({ok: true, link, guildId, invitedUsers});
    })
}

const getInviteInfo = (req, res) => {
    const myId = req.user.id;
    const inviteLink = req.query.id;

    db.get(getInviteLinkQuery, [inviteLink], function (err, inviteRow) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        const invited = JSON.parse(inviteRow.invited_users);

        if (!invited.includes(myId)) {
            return res.json({ok: false, status: 'you_not_invited', message: 'you_not_invited'});
        }

        db.get(getGuildInfoQuery, [inviteRow.guild_id], function (err, guildRow) {
            if (err) {
                console.log(err);
                return res.json({ok: false, status: 'error', message: err.message});
            }

            db.get(getUserInfoQuery, [inviteRow.sender_id], function (err, userRow) {
                if (err) {
                    console.log(err);
                    return res.json({ok: false, status: 'error', message: err.message});
                }

                return res.json({ok: true, user: userRow, guild: guildRow});
            })
        })
    })
}

const acceptInvite = (req, res) => {
    const myId = req.user.id;
    const inviteLink = req.query.id;

    db.get(getInviteLinkQuery, [inviteLink], function (err, inviteRow) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        const invited = JSON.parse(inviteRow.invited_users);

        if (!invited.includes(myId)) {
            return res.json({ok: false, status: 'you_not_invited', message: 'you_not_invited'});
        }

        db.run(addMemberQuery, [myId, inviteRow.guild_id, 'member', myId, inviteRow.guild_id], function (err) {
            if (err) {
                console.log(err);
                return res.json({ok: false, status: 'error', message: err.message});
            }

            db.get(getGuildInfoById, [inviteRow.guild_id], function (err, result) {
                if (err) {
                    console.log(err);
                    return res.json({ok: false, status: 'error', message: err.message});
                }

                serverEmitter.emit('guild-updates', {guildId: inviteRow.guild_id, eventType: "userAdd"});

                return res.json({ok: true, guild: result});
            })
        })
    })
}

const kickUser = (req, res) => {
    const myId = req.user.id;
    const guildId = req.body.guildId;
    const memberInGuildId = req.body.memberInGuildId;
    const userId = req.body.userId;

    db.get(getGuildInfoById, [guildId], function (err, row) {
        if (err) {
            console.log(err);
            return res.json({ok: false, status: 'error', message: err.message});
        }

        if (row.creatorId !== myId) {
            return res.json({ok: false, status: 'you are not creator', message: "you are not creator"});
        }

        db.run(kickUserFromGuildQuery, [memberInGuildId], function (err) {
            serverEmitter.emit('guild-updates', {guildId, eventType: "userKick", eventArgs: {kickedUserId: userId}});

            return res.json({ok: true, memberInGuildId, guildId});
        })
    })
}

module.exports = {
    getGuilds,
    loadGuild,
    createGuild,
    generateInviteLink,
    getInviteInfo,
    acceptInvite,
    createCategory,
    deleteCategory,
    createChannel,
    deleteChannel,
    kickUser
}