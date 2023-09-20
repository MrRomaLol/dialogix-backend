const {Router} = require('express');
const router = Router();

const apiV1 = require('./v1/api');

router.use('/v1', apiV1);

router.get('/', (req, res) => {
    res.send(
        '<h1>Apis:</h1>' +
        '<a href="/api/v1">ApiV1</a>'
    );
})

module.exports = router;