const {Router} = require('express');
const {dirname, join} = require("path");
const appDir = dirname(require.main.filename);
const router = Router();

router.get('/:guildId/:avatar', (req, res) => {
    const guildId = req.params.guildId;
    const avatar = req.params.avatar;

    const imagePath = join(appDir, `content/guilds/${guildId}/avatars/${avatar}`);

    res.sendFile(imagePath);
})

module.exports = router;