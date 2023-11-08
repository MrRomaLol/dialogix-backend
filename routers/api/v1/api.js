const {Router} = require('express');
const router = Router();

const {loginStatus, register, logout, login} = require("./account");
const friendsRoute = require('./friends')
const guildsRoute = require('./guilds')
const chatsRoute = require('./chats')
const cdnRoute = require('./cdn')
const upload = require('./upload')

//main
router.get('/', (req, res) => {
    res.send(
        '<h1>Api v1 good!</h1>'
    );
});

//cdn
router.use('/cdn', cdnRoute)

//account
router.post('/login', login)
router.post('/logout', logout)
router.post('/register', register);
router.get('/loginstatus', loginStatus);

//friends
router.use('/friends', friendsRoute);

//guilds
router.use('/guilds', guildsRoute);

//chats
router.use('/chats', chatsRoute);

//upload
router.use('/upload', upload);



module.exports = router;