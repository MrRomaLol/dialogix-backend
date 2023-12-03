const {Router} = require("express");
const {createGuild, getGuilds, createCategory, loadGuild, createChannel, deleteCategory, deleteChannel} = require("./guilds");

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

router.get('/', getGuilds);
router.get('/info', loadGuild);
router.post('/create', createGuild);
router.post('/createcategory', createCategory);
router.patch('/deletecategory', deleteCategory);
router.post('/createchannel', createChannel);
router.patch('/deletechannel', deleteChannel);

module.exports = router;