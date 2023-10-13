const db = require("../../../database/db")

const addFriend = (req, res) => {


    //req.body.nick


    res.json({
        ok: true
    })
}

module.exports = {addFriend}