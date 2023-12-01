const {Router} = require('express');
const {dirname, join} = require("path");
const appDir = dirname(require.main.filename);

const router = Router();

router.get('/*', (req, res) => {
    res.sendFile(join(appDir, 'public', 'index.html'));
});

module.exports = router;