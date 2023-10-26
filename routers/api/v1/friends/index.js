const {Router} = require("express");

const router = Router();

const {
    sendRequest,
    getFriends,
    acceptRequest,
    rejectRequest,
    unSendRequest
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
// router.get('/pending', getPending);
// router.get('/sent', getSent); //бурда
router.post('/send', sendRequest);
router.delete('/send', unSendRequest);
router.post('/accept', acceptRequest);
router.post('/reject', rejectRequest);


module.exports = router;