const {getRandomName} = require("../../../../utils/utils");
const {writeImageFromBuffer} = require("../../../../utils/fs");
const db = require("../../../../database/db");
const serverEmitter = require("../../../../events");
const {getUserSettings, updateUserSetting} = require("../../../../settings/userSettings");

const updateUserQuery = `
UPDATE [users]
SET nickname = ?, avatar_url = ?
WHERE id = ?;
`

const fetchSettings = (req, res) => {
    const myId = req.user.id;

    getUserSettings(myId)
        .then(settings => {
            res.json({
                ok: true,
                settings
            })
        })
        .catch(error => {
            console.error(error);
        })
}

const updateSetting = (req, res) => {
    const myId = req.user.id;
    const settingId = req.body.settingId;
    const settingName = req.body.settingName;
    const settingValue = req.body.settingValue;

    updateUserSetting(settingId, myId, settingName, settingValue, ({id, settingName, settingValue}) => {
        res.json({
            ok: true,
            setting: {
                id, settingName, settingValue
            }
        })
    })
}

const updateProfile = (req, res) => {
    const myId = req.user.id;

    const nickname = req.body.nickname;

    const update = (avatar) => {
        db.run(updateUserQuery, [nickname, avatar, myId], (err) => {
            if (err) {
                console.log(err);
                return res.json({ok: false, status: 'error', message: err.message});
            }

            const profileInfo = {
                nickname,
                avatar_url: avatar,
            }

            serverEmitter.emit('profile-update', {profileInfo, id: myId});

            return res.json({
                ok: true,
                profileInfo
            })
        });
    }

    const base64Avatar = req.body.avatar;
    if (base64Avatar) {
        const avatarName = `${getRandomName(20)}.jpg`;
        writeImageFromBuffer(`content/users/${myId}/avatars/${avatarName}`, base64Avatar, () => {
            update(avatarName);
        })
    } else {
        update();
    }
}

module.exports = {updateProfile, updateSetting, fetchSettings}