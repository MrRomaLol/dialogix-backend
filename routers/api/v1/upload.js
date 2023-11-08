const {Router} = require("express");
const multer = require('multer');
const {extname, join, dirname} = require("path");
const appDir = dirname(require.main.filename);
const {mkdirSync} = require("fs");

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.user.id;
        const destinationFolder = join(appDir, `content/private/${userId}/${req.folderName}`);
        mkdirSync(destinationFolder, {recursive: true});
        cb(null, destinationFolder);
    },
    filename: function (req, file, cb) {
        const allowedCharactersRegex = /^[a-zA-Z0-9а-яА-Я_.]+$/;
        const originalName = file.originalname;
        const isAllowed = allowedCharactersRegex.test(originalName);

        if (isAllowed) {
            cb(null, originalName);
        } else {
            const sanitizedFilename = originalName.replace(/[^a-zA-Z0-9а-яА-Я_.]/g, '');
            cb(null, sanitizedFilename);
        }
    }
});

const upload = multer({storage});

router.use(function (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            ok: false,
            status: 'unauthorized'
        })
    }
    next();
})

router.post('/', (req, res) => {
    const time = Date.now();
    req.folderName = time;
    upload.array('files', 10)(req, res, (err) => {
        if (err) {
            return res.json({ok: false, status: 'error', message: err.message});
        }

        const newFiles = [];

        req.files.forEach((obj) => {
            newFiles.push({
                name: obj.filename,
                size: obj.size,

            })
        })

        res.json({
            ok: true,
            folderTime: time,
            newFiles
        });
    });
})

module.exports = router;