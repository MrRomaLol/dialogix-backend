const {Router} = require('express');
const router = Router();

const {loginStatus, register, logout, login} = require("./account");
const friendsRoute = require('./friends')

//main
router.get('/', (req, res) => {
    res.send(
        '<h1>Api v1 good!</h1>'
    );
});

//test
router.post('/test', (req, res) => {
    console.log(req.cookies);
    res.status(200).json({
        ok: true
    })
})

//account
router.post('/login', login)
router.post('/logout', logout)
router.post('/register', register);
router.get('/loginstatus', loginStatus);

//friends
router.use('/friends', friendsRoute);



module.exports = router;