const {getRandomName} = require("../../../../utils/utils");
const {writeImageFromBuffer} = require("../../../../utils/fs");
const db = require("../../../../database/db");

const updateUserQuery = `
UPDATE [users]
SET nickname = ?, avatar_url = ?
WHERE id = ?;
`

const updateProfile = (req, res) => {
    const myId = req.user.id;

    const nickname = req.body.nickname;

    const update = (avatar) => {
        db.run(updateUserQuery, [nickname, avatar, myId], (err) => {
            if (err) {
                console.log(err);
                return res.json({ok: false, status: 'error', message: err.message});
            }
            return res.json({
                ok: true,
                profileInfo: {
                    nickname,
                    avatar_url: avatar,
                }
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

module.exports = {updateProfile}