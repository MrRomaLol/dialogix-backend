const {Router} = require("express");
const {getMessages, sendMessage} = require("./chats");

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

router.get('/', getMessages);
router.post('/send', sendMessage);

module.exports = router;