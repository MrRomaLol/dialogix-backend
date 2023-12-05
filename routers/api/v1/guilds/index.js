const {Router} = require("express");
const {createGuild, getGuilds, createCategory, loadGuild, createChannel, deleteCategory, deleteChannel,
    generateInviteLink, getInviteInfo, acceptInvite, kickUser
} = require("./guilds");

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
router.get('/invite', getInviteInfo);
router.post('/invite', generateInviteLink);
router.post('/acceptinvite', acceptInvite)
router.post('/createcategory', createCategory);
router.patch('/deletecategory', deleteCategory);
router.post('/createchannel', createChannel);
router.patch('/deletechannel', deleteChannel);
router.patch('/kick', kickUser);

module.exports = router;