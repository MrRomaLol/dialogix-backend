const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database/local_database.db');

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    username TEXT UNIQUE, \
    email TEXT UNIQUE, \
    hashed_password BLOB, \
    salt BLOB, \
    register_date DATETIME DEFAULT CURRENT_TIMESTAMP \
  )");
});

module.exports = db;