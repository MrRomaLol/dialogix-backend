const {Router} = require("express");

const router = Router();

const {
    sendRequest,
    getFriends,
    acceptRequest,
    rejectRequest,
    unSendRequest, deleteFriend
} = require("./friends");


router.use(function (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            ok: false,
            status: 'unauthorized'
        })
    }
    next();
})

router.get('/', getFriends);
router.post('/send', sendRequest);
router.patch('/send', unSendRequest);
router.post('/accept', acceptRequest);
router.post('/reject', rejectRequest);
router.post('/delete', deleteFriend);


module.exports = router;