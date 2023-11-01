const fs = require('fs');
const getDirName = require('path').dirname;

function writeImageFromBuffer(path, image, cb) {
    fs.mkdir(getDirName(path), {recursive: true}, function (err) {
        if (err) return cb(err);
        const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        fs.writeFile(path, imageBuffer, 'binary', cb);
    });
}

module.exports = {writeImageFromBuffer}