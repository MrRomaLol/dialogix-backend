const {Router} = require('express');
const {dirname, join} = require("path");
const appDir = dirname(require.main.filename);
const router = Router();

router.get('/:userId/:avatar', (req, res) => {
    const userId = req.params.userId;
    const avatar = req.params.avatar;

    const imagePath = join(appDir, `content/users/${userId}/avatars/${avatar}`);

    res.sendFile(imagePath);
})

module.exports = router;