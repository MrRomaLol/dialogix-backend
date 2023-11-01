const {Router} = require("express");
const {createGuild, getGuilds} = require("./guilds");

const router = Router();

router.use(function (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            ok: false,
            status: 'unauthorized'
        })
    }
    next();
})

router.get('/', getGuilds)
router.post('/create', createGuild)

module.exports = router;