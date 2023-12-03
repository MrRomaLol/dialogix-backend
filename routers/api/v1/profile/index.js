const {Router} = require("express");

const {updateProfile, fetchSettings, updateSetting, updateAppBackground} = require("./profile");

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
router.post('/uploadbackground', updateAppBackground);

module.exports = router