const {Router} = require("express");

const router = Router();

const {
    sendRequest,
    getPending,
    getFriends,
    acceptRequest,
    rejectRequest,
    getSent,
    unSendRequest
} = require("./friends");


router.get('/', getFriends);
router.get('/pending', getPending);
router.get('/sent', getSent); //бурда
router.post('/send', sendRequest);
router.delete('/send', unSendRequest);
router.post('/accept', acceptRequest);
router.post('/reject', rejectRequest);


module.exports = router;