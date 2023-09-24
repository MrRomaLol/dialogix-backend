const {Router} = require('express');
const router = Router();

const {loginStatus, register, logout, login} = require("./account");


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
router.post('/loginstatus', loginStatus);


module.exports = router;