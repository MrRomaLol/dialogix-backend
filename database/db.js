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

let isDBClosed = false;

const closeDB = (cb) => {
    if (isDBClosed) return;
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        } else {
            isDBClosed = true;
            console.log('Database connection closed.');
            cb?.();
        }
    });
}

process.on('exit', () => {
    closeDB();
});

process.on('SIGINT', () => {
    closeDB(() => {
        process.exit(0);
    });
});

module.exports = db;