const {Router} = require("express");
const guildsCDN = require('./guilds');
const usersCDN = require('./users');
const {dirname, join} = require("path");
const appDir = dirname(require.main.filename);

const router = Router();

router.get('/', (req, res) => {
    res.send(
        '<h1>CDN ready to give you content!</h1>'
    );
});

router.use('/guilds', guildsCDN);
router.use('/users', usersCDN);

router.get('/:userId/:timeFolder/:filename', (req, res) => {
    const userId = req.params.userId;
    const time = req.params.timeFolder;
    const filename = req.params.filename;

    const filePath = join(appDir, `content/private/${userId}/${time}/${filename}`);

    res.download(filePath);
})


module.exports = router;