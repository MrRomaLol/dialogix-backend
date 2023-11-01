const {Router} = require("express");
const guildsCDN = require('./guilds');

const router = Router();

router.get('/', (req, res) => {
    res.send(
        '<h1>CDN ready to give you content!</h1>'
    );
});

router.use('/guilds', guildsCDN);

module.exports = router;