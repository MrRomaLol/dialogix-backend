const {Router} = require('express');
const router = Router();

const {loginStatus, register, logout, login} = require("./account");
const friendsRoute = require('./friends')
const guildsRoute = require('./guilds')
const cdnRoute = require('./cdn')

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



module.exports = router;