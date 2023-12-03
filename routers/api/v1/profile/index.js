const {Router} = require("express");

const {updateProfile, fetchSettings, updateSetting} = require("./profile");

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

router.post('/update', updateProfile);
router.get('/settings', fetchSettings);
router.post('/settings', updateSetting);

module.exports = router