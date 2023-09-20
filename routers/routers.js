const {Router} = require('express');
const router = Router();

const main = require('./main/main');
const apis = require('./api/apis');

router.use('/api', apis);
router.use('/', main);

module.exports = router;
