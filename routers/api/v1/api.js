const {Router} = require('express');
const router = Router();

const {loginStatus, register, logout, login} = require("./account");
const {addFriend} = require("./friends");


//main
router.get('/', (req, res) => {
    res.send(
        '<h1>Api v1 good!</h1>'
    );
});

//account
router.post('/login', login)
router.post('/logout', logout)
router.post('/register', register);
// router.get('/loginstatus', loginStatus);

//friends
router.post('/addfriend', addFriend);


module.exports = router;