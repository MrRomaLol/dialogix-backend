const {Router} = require("express");
const guildsCDN = require('./guilds');
const usersCDN = require('./users');

const router = Router();

router.get('/', (req, res) => {
    res.send(
        '<h1>CDN ready to give you content!</h1>'
    );
});

router.use('/guilds', guildsCDN);
router.use('/users', usersCDN);

module.exports = router;