const sqlite3 = require('sqlite3');
const {readFileSync} = require("fs");

const db = new sqlite3.Database('./database/local_database.db');

const sqlQuery = readFileSync("./database/queries/create_tables.sql").toString();
const queryArr = sqlQuery.toString().split(');');

db.serialize(function () {
    queryArr.forEach((query) => {
        if (query) {
            query += ');';
            db.run(query);
        }
    })
});

module.exports = db;